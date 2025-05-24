import { Dispose } from '../types'
import { onDestroyMetadataKey } from '../utils/symbols'

/**
 * @onDispose decorator
 * @description This decorator is used to mark a method as a dispose method. It will automatically
 * create a dispose function that will be called when the instance is disposed by the disposal of the parent dependency container.
 *
 * The method can also accept an optional Cleanup function as a parameter.
 *
 * @example
 * \@onDispose
 *  dispose() {
 *     // do something
 *  }
 */
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
  const onDisposeProperties = new Set<string>(Reflect.getMetadata(onDestroyMetadataKey, instance) ?? [])

  onDisposeProperties.forEach((propName: string) => {
    const disposeFn = instance[propName] as () => void

    disposers.push(() => {
      disposeFn.call(instance)
    })
  })
}
