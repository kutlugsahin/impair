import { onUnmountMetadataKey } from '../utils/symbols'

/**
 * @onUnmount decorator
 * @description This decorator is used to mark a method as an onUnmount method.
 * It will automatically create a unmount function that will be called when the containing ServiceProvider or Component is unmounted
 * @example
 * \@onUnmount
 *  unmount() {
 *     // do something
 *  }
 */
export function onUnmount(target: any, propertyKey: string) {
  const onUnmounts: string[] = Reflect.getMetadata(onUnmountMetadataKey, target) ?? []
  onUnmounts.push(propertyKey)
  Reflect.metadata(onUnmountMetadataKey, onUnmounts)(target)
}

export function getOnUnmountMethods(instance: any): (() => void)[] {
  const onUnmountProperties = new Set<string>(Reflect.getMetadata(onUnmountMetadataKey, instance) ?? [])

  return [...onUnmountProperties].map((propName: string) => {
    const unmountFn = instance[propName] as () => void

    return unmountFn.bind(instance)
  })
}
