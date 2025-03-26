import { Dispose } from '../types'
import { onDestroyMetadataKey } from '../utils/symbols'

export function onDispose(target: any, propertyKey: string) {
  if (propertyKey !== 'dispose') {
    if (!target['dispose']) {
      Object.defineProperty(target, 'dispose', {
        value: function dispose() {},
        writable: true,
        configurable: true,
      })
    }

    const onDisposes: string[] = Reflect.getMetadata(onDestroyMetadataKey, target) ?? []
    onDisposes.push(propertyKey)
    Reflect.metadata(onDestroyMetadataKey, onDisposes)(target)
  }
}

export function initOnDispose(instance: any, disposers: Dispose[]) {
  const onDisposeProperties: string[] = Reflect.getMetadata(onDestroyMetadataKey, instance) ?? []

  onDisposeProperties.forEach((propName: string) => {
    const disposeFn = instance[propName] as () => void

    disposers.push(() => {
      disposeFn.call(instance)
    })
  })
}
