import { TriggerCleanup } from '../types'
import { onMountMetadataKey } from '../utils/symbols'

/**
 * @onMount decorator
 * @description This decorator is used to mark a method as an onMount method.
 * It will automatically create a mount function that will be called when the containing ServiceProvider or Component is mounted
 * The method can also accept an optional Cleanup function which will be called when containing ServiceProvider or Component is unmounted.
 *
 * @example
 * \@onMount
 *  mount(cleanup: Cleanup) {
 *     // do something
 *  }
 */
export function onMount(target: any, propertyKey: string) {
  const onMounts: string[] = Reflect.getMetadata(onMountMetadataKey, target) ?? []
  onMounts.push(propertyKey)
  Reflect.metadata(onMountMetadataKey, onMounts)(target)
}

export function getOnMountMethods(instance: any): ((cleanup: TriggerCleanup) => void)[] {
  const onMountProperties: string[] = Reflect.getMetadata(onMountMetadataKey, instance) ?? []

  return onMountProperties.map((propName: string) => {
    const mountFn = instance[propName] as () => void

    return mountFn.bind(instance)
  })
}
