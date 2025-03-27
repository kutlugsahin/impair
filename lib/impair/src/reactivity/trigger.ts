import { stop } from '@vue/reactivity'
import { Dictionary, Dispose, EffectCallback } from '../types'
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

export function trigger(target: any, propertyKey: string) {
  return addTriggerMetadata(target, propertyKey)
}

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

      const effectRunner = flush === 'sync' ? effect : asyncEffect

      const runner = effectRunner(() => {
        return effectFn.call(instance)
      })

      disposers.push(() => {
        stop(runner)
      })

      Object.defineProperty(instance, propertyKey, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: () => {
          runner()
        },
      })
    })
  }
}
