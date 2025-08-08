import { computed, isProxy, toReadonly } from '@vue/reactivity'
import { getAllPropertiesAndMethods } from './object'

export function toReadOnlyService<T>(service: T): T {
  const result: T = {} as T

  getAllPropertiesAndMethods(service).forEach((field) => {
    let delegate: (() => unknown) | undefined

    Object.defineProperty(result, field, {
      get() {
        if (!delegate) {
          const value = service[field as keyof T]

          if (isProxy(value)) {
            const readonly = computed(() => {
              return toReadonly(service[field as keyof T])
            })

            delegate = () => readonly.value
          } else {
            delegate = () => service[field as keyof T]
          }
        }

        return delegate()
      },
      configurable: true,
      enumerable: true,
    })
  })

  return result
}
