import { Cleanup, Dispose, TriggerCleanup } from '../types'
import { onInitMetadataKey } from '../utils/symbols'

/**
 * This decorator is used to mark a method as an init method.
 * Init methods are called after the instance is created and all the decorators are processed
 * Takes an optional cleanup function as a parameter.
 * The cleanup function will be called when the instance is disposed by the disposal of the parent dependency container.
 *```ts
 * \@onInit
 *public init(cleanup: Cleanup) {
 *  const abortController = new AbortController()
 *  cleanup(() => {
 *    abortController.abort()
 *  })
 *
 *  const response = await loadData(this.state.id, abortController.signal);
 *  // do something
 *}
 *```
 */
export function onInit(target: any, propertyKey: string) {
  const onInits: string[] = Reflect.getMetadata(onInitMetadataKey, target) ?? []
  onInits.push(propertyKey)
  Reflect.metadata(onInitMetadataKey, onInits)(target)
}

export function initOnInit(instance: any, disposers: Dispose[]) {
  const onInitProperties = new Set<string>(Reflect.getMetadata(onInitMetadataKey, instance) ?? [])

  onInitProperties.forEach((propName: string) => {
    const initFn = instance[propName] as (cleanup: TriggerCleanup) => void

    let cleanup: Cleanup | undefined = undefined

    initFn.call(instance, (clb) => {
      cleanup = clb
    })

    disposers.push(() => {
      cleanup?.()
    })
  })
}
