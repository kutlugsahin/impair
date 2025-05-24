import { computed, ComputedRefImpl, effectScope } from '@vue/reactivity'

import { Dictionary, Dispose } from '../types'
import { derivedMetadataKey } from '../utils/symbols'

type DerivedInfo = {
  propertyKey: string
  descriptor: PropertyDescriptor
}

/**
 * This decorator is used to mark a property as a derived property. It will automatically
 * create a computed property that will be updated when the reactive dependencies change.
 * The property must be a getter function.
 */
export function derived(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const propNames = Reflect.getMetadata(derivedMetadataKey, target) ?? []
  propNames.push({
    propertyKey,
    descriptor,
  })
  return Reflect.metadata(derivedMetadataKey, propNames)(target)
}

type InitParams = {
  instance: Dictionary
  disposers: Dispose[]
}

export function initDerived({ disposers, instance }: InitParams) {
  const cachedProperties: DerivedInfo[] = Reflect.getMetadata(derivedMetadataKey, instance)

  if (cachedProperties) {
    const propertyMap = new Map<string, DerivedInfo>()

    cachedProperties.forEach((derivedInfo) => {
      propertyMap.set(derivedInfo.propertyKey, derivedInfo)
    })

    propertyMap.forEach(({ propertyKey, descriptor }: any) => {
      const getter = descriptor.get

      if (typeof getter !== 'function') {
        throw new Error(`@derived property "${propertyKey}" must have a getter function.`)
      }

      let computedValue: ComputedRefImpl

      const scope = effectScope()

      scope.run(() => {
        computedValue = computed(() => {
          return getter.call(instance)
        }) as unknown as ComputedRefImpl
      })

      disposers.push(() => {
        scope.stop()
      })

      Object.defineProperty(instance, propertyKey, {
        enumerable: true,
        configurable: true,
        get() {
          return computedValue.value
        },
      })
    })
  }
}
