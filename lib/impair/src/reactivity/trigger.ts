import { stop } from '@vue/reactivity'
import { Cleanup, Dictionary, Dispose, EffectCallback } from '../types'
import { triggerMetadataKey } from '../utils/symbols'
import { asyncEffect, effect } from '../reactivity/effect'

type TriggerInfo = {
  propertyKey: string
  flush: 'sync' | 'async'
}

function addTriggerMetadata(target: any, propertyKey: string, flush: 'sync' | 'async' = 'sync') {
  const triggerInfoArr: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, target) ?? []
  triggerInfoArr.push({
    propertyKey,
    flush,
  })
  return Reflect.metadata(triggerMetadataKey, triggerInfoArr)(target)
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

type InitParams = {
  instance: Dictionary
  disposers: Dispose[]
}

export function initTrigger({ instance, disposers }: InitParams) {
  const triggerProperties: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, instance)

  if (triggerProperties) {
    triggerProperties.forEach(({ flush, propertyKey }) => {
      const effectFn = instance[propertyKey] as EffectCallback

      if (typeof effectFn !== 'function') {
        throw new Error(
          `@trigger decorator can only be used on methods with optional Cleanup param, not on ${typeof effectFn}`,
        )
      }

      const triggerMethod = effectFn.bind(instance)

      const effectRunner = flush === 'sync' ? effect : asyncEffect

      let cleanup: Cleanup | undefined = undefined

      const runner = effectRunner(() => {
        cleanup?.()
        cleanup = undefined
        return triggerMethod((clb: Cleanup) => {
          cleanup = clb
        })
      })

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
