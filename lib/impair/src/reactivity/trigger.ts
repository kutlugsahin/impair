import { stop } from '@vue/reactivity'
import { Cleanup, Dictionary, Dispose, EffectCallback } from '../types'
import { triggerMetadataKey } from '../utils/symbols'
import { asyncEffect, debouncedEffect, effect, throttledEffect } from '../reactivity/effect'

type TriggerFlush = 'sync' | 'async' | 'debounce' | 'throttle'

type TriggerInfo = {
  propertyKey: string
  flush: TriggerFlush
  ms?: number
}

function addTriggerMetadata(target: any, propertyKey: string, flush: TriggerFlush = 'sync', ms?: number) {
  const triggerInfoArr: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, target) ?? []
  triggerInfoArr.push({
    propertyKey,
    flush,
    ms,
  })
  return Reflect.metadata(triggerMetadataKey, triggerInfoArr)(target)
}

function assertNonNegativeNumber(name: string, ms: unknown): asserts ms is number {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) {
    throw new Error(`@trigger.${name}(ms) requires a non-negative finite number, got ${String(ms)}`)
  }
}

/**
 * This decorator is used to mark a method as a trigger. It will automatically
 * create a reactive effect that will call the method when the reactive dependencies change.
 * The method can also accept an optional Cleanup function as a parameter.
 *```ts
 *  @trigger
 *  public fetchData(cleanup: Cleanup) {
 *   const abortController = new AbortController()
 *   cleanup(() => {
 *     abortController.abort()
 *   })
 *
 *   const response = await loadData(this.state.id, abortController.signal);
 *   // do something
 * }
 *```
 */
export function trigger(target: any, propertyKey: string) {
  return addTriggerMetadata(target, propertyKey)
}

/**
 * This decorator is used to mark a method as a trigger. It will automatically
 * create a reactive effect that will call the method when the reactive dependencies change.
 * Calls will be scheduled in the next tick.
 * The method can also accept an optional cleanup function as a parameter.
 */
trigger.async = function (target: any, propertyKey: string) {
  return addTriggerMetadata(target, propertyKey, 'async')
}

/**
 * @trigger.debounce(ms)
 * Trailing-only debounce. The trigger re-runs `ms` milliseconds after the most recent
 * dependency change. Bursts of changes inside the same `ms` window collapse to one run
 * on the final values. The cleanup callback (if any) fires before each actual invocation.
 */
trigger.debounce = function (ms: number) {
  assertNonNegativeNumber('debounce', ms)
  return function (target: any, propertyKey: string) {
    return addTriggerMetadata(target, propertyKey, 'debounce', ms)
  }
}

/**
 * @trigger.throttle(ms)
 * Leading + trailing throttle. At most one run per `ms` milliseconds: the first change
 * in a window fires immediately; if further changes arrive during the window, one trailing
 * run is scheduled at window close. The cleanup callback (if any) fires before each
 * actual invocation.
 */
trigger.throttle = function (ms: number) {
  assertNonNegativeNumber('throttle', ms)
  return function (target: any, propertyKey: string) {
    return addTriggerMetadata(target, propertyKey, 'throttle', ms)
  }
}

type InitParams = {
  instance: Dictionary
  disposers: Dispose[]
}

export function initTrigger({ instance, disposers }: InitParams) {
  const triggerProperties: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, instance)

  if (triggerProperties) {
    const propertyMap = new Map<string, TriggerInfo>()

    triggerProperties.forEach((triggerInfo) => {
      propertyMap.set(triggerInfo.propertyKey, triggerInfo)
    })

    propertyMap.forEach(({ flush, propertyKey, ms }) => {
      const effectFn = instance[propertyKey] as EffectCallback

      if (typeof effectFn !== 'function') {
        throw new Error(
          `@trigger decorator can only be used on methods with optional Cleanup param, not on ${typeof effectFn}`,
        )
      }

      const triggerMethod = effectFn.bind(instance)

      let cleanup: Cleanup | undefined = undefined

      const body = () => {
        cleanup?.()
        cleanup = undefined
        return triggerMethod((clb: Cleanup) => {
          cleanup = clb
        })
      }

      const runner =
        flush === 'sync'
          ? effect(body)
          : flush === 'async'
            ? asyncEffect(body)
            : flush === 'debounce'
              ? debouncedEffect(body, ms!)
              : throttledEffect(body, ms!)

      disposers.push(() => {
        cleanup?.()
        stop(runner)
      })

      Object.defineProperty(instance, propertyKey, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: triggerMethod,
      })
    })
  }
}
