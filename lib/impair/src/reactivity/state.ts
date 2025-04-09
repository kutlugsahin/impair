import { Ref, ref, shallowReactive, shallowRef } from '@vue/reactivity'

import { Dictionary } from '../types'
import { stateMetadataKey } from '../utils/symbols'

export type StateType = 'shallow' | 'deep' | 'atom'

export type StateMetadata = {
  propertyKey: string
  type: StateType
}

function registerStateMetadata(target: any, metadata: StateMetadata) {
  const statePropMetadata: StateMetadata[] = Reflect.getMetadata(stateMetadataKey, target) ?? []
  statePropMetadata.push(metadata)
  return Reflect.metadata(stateMetadataKey, statePropMetadata)(target)
}

export function state(target: any, propertyKey: string) {
  return registerStateMetadata(target, {
    propertyKey,
    type: 'deep',
  })
}

function shallowState(target: any, propertyKey: string) {
  return registerStateMetadata(target, {
    propertyKey,
    type: 'shallow',
  })
}

function atomState(target: any, propertyKey: string) {
  return registerStateMetadata(target, {
    propertyKey,
    type: 'atom',
  })
}

state.shallow = shallowState
state.atom = atomState

type InitParams = {
  instance: Dictionary
}

function createReactiveState(initialValue: unknown, type: StateType): Ref {
  if (type === 'atom') {
    return shallowRef(initialValue)
  }

  if (type === 'deep') {
    return ref(initialValue)
  }

  if (type === 'shallow') {
    if (initialValue != null && typeof initialValue === 'object') {
      return shallowRef(shallowReactive(initialValue))
    } else {
      return shallowRef(initialValue)
    }
  }

  return ref(initialValue)
}

export function initState({ instance }: InitParams) {
  const stateValueMap = new Map<string, Ref<any>>()

  const stateProperties: StateMetadata[] = Reflect.getMetadata(stateMetadataKey, instance)

  if (stateProperties) {
    stateProperties.forEach(({ propertyKey, type }) => {
      const initialValue = instance[propertyKey]

      const reactiveState = createReactiveState(initialValue, type)

      stateValueMap.set(propertyKey, reactiveState)

      Object.defineProperty(instance, propertyKey, {
        get() {
          return stateValueMap.get(propertyKey)?.value
        },
        set(newValue) {
          const refValue = stateValueMap.get(propertyKey)

          if (refValue) {
            refValue.value =
              type === 'shallow' && newValue != null && typeof newValue === 'object'
                ? shallowReactive(newValue)
                : newValue
          } else {
            console.error(`No ref value found for ${propertyKey}`)
          }
        },
      })
    })
  }
}
