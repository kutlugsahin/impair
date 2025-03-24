import { onUnmountMetadataKey } from '../utils/symbols'

export function onUnmount(target: any, propertyKey: string) {
  const onUnmounts: string[] = Reflect.getMetadata(onUnmountMetadataKey, target) ?? []
  onUnmounts.push(propertyKey)
  Reflect.metadata(onUnmountMetadataKey, onUnmounts)(target)
}

export function getOnUnmountMethods(instance: any): (() => void)[] {
  const onUnmountProperties: string[] = Reflect.getMetadata(onUnmountMetadataKey, instance) ?? []

  return onUnmountProperties.map((propName: string) => {
    const unmountFn = instance[propName] as () => void

    return unmountFn.bind(instance)
  })
}
