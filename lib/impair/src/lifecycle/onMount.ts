import { Dispose } from '../types'
import { onMountMetadataKey } from '../utils/symbols'

export function onMount(target: any, propertyKey: string) {
  const onMounts: string[] = Reflect.getMetadata(onMountMetadataKey, target) ?? []
  onMounts.push(propertyKey)
  Reflect.metadata(onMountMetadataKey, onMounts)(target)
}

export function getOnMountMethods(instance: any): (Dispose | (() => Dispose))[] {
  const onMountProperties: string[] = Reflect.getMetadata(onMountMetadataKey, instance) ?? []

  return onMountProperties.map((propName: string) => {
    const mountFn = instance[propName] as () => void

    return mountFn.bind(instance)
  })
}
