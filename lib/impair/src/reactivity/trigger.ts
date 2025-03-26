import { stop } from '@vue/reactivity'
import { Dictionary, Dispose } from '../types'
import { triggerMetadataKey } from '../utils/symbols'
import { asyncEffect, effect } from '../reactivity/effect'

type TriggerInfo = {
  propertyKey: string
  flush: 'sync' | 'async'
}

export function trigger(target: any, propertyKey: string) {
  const triggerInfoArr: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, target) ?? []
  triggerInfoArr.push({
    propertyKey,
    flush: 'sync',
  })
  return Reflect.metadata(triggerMetadataKey, triggerInfoArr)(target)
}

trigger.async = function (target: any, propertyKey: string) {
  const triggerInfoArr: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, target) ?? []
  triggerInfoArr.push({
    propertyKey,
    flush: 'async',
  })
  return Reflect.metadata(triggerMetadataKey, triggerInfoArr)(target)
}

type InitParams = {
  instance: Dictionary
  disposers: Dispose[]
}

export function initTrigger({ instance, disposers }: InitParams) {
  const triggerProperties: TriggerInfo[] = Reflect.getMetadata(triggerMetadataKey, instance)

  if (triggerProperties) {
    triggerProperties.forEach(({ flush, propertyKey }) => {
      const effectFn = instance[propertyKey] as () => unknown

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
