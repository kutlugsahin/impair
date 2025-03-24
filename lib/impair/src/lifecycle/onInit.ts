import { onInitMetadataKey } from '../utils/symbols'

export function onInit(target: any, propertyKey: string) {
  const onInits: string[] = Reflect.getMetadata(onInitMetadataKey, target) ?? []
  onInits.push(propertyKey)
  Reflect.metadata(onInitMetadataKey, onInits)(target)
}

export function initOnInit(instance: any) {
  const onInitProperties = Reflect.getMetadata(onInitMetadataKey, instance)

  if (onInitProperties) {
    onInitProperties.forEach((propName: string) => {
      const initFn = instance[propName] as () => void

      initFn.call(instance)
    })
  }
}
