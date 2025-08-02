import {
  computed,
  effect,
  effectScope,
  reactive,
  ref,
  shallowReactive,
  shallowRef,
  stop,
  readonly,
  shallowReadonly,
} from '@vue/reactivity'
import { Dispose } from '../types'

const Reactivity = {
  ref,
  shallowRef,
  reactive,
  shallowReactive,
  effect,
  effectScope,
  stop,
  computed,
  readonly,
  shallowReadonly,
} as const

export type DecoratorInitializer = (instance: any, propertyKey: string, reactivity: typeof Reactivity) => Dispose | void

type Decorator = (target: any, propertyKey: string) => void

type DecoratorMetadata = {
  propertyKey: string
  initializer: DecoratorInitializer
}

const metadataKey = Symbol('customDecoratorMetadata')

export function createDecorator(initializer: DecoratorInitializer): Decorator {
  return function (target: any, propertyKey: string) {
    const decoratorMetadataList: DecoratorMetadata[] = Reflect.getMetadata(metadataKey, target) ?? []

    decoratorMetadataList.push({
      propertyKey,
      initializer,
    })

    Reflect.metadata(metadataKey, decoratorMetadataList)(target)
  }
}

export function initCustomDecorators(instance: any, disposers: Dispose[]) {
  const decoratorMetadataList: DecoratorMetadata[] = Reflect.getMetadata(metadataKey, instance)

  decoratorMetadataList?.forEach(({ initializer, propertyKey }) => {
    const dispose = initializer(instance, propertyKey, Reactivity)

    if (dispose) {
      disposers.push(dispose)
    }
  })
}
