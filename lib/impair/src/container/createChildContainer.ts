import { DependencyContainer, InjectionToken } from 'tsyringe'

import { injectableMetadataKey } from '../utils/symbols'
import { initInstance, isInitialized } from './initInstance'

function isInjectionToken(token: InjectionToken): boolean {
  return typeof token === 'function' || typeof token === 'symbol' || typeof token === 'string'
}

function isInjectableClass(instance: any): boolean {
  const constructor = Object.getPrototypeOf(instance).constructor
  return typeof constructor === 'function' && Reflect.getMetadata(injectableMetadataKey, constructor)
}

export function createChildContainer(
  parentContainer: DependencyContainer,
  onInstance: (instance: any) => void,
): DependencyContainer {
  const container = parentContainer.createChildContainer()

  const resolve = container.resolve as any

  const tokens = new Set<InjectionToken>()

  container.resolve = function (...args: any[]) {
    const token = args[0]

    if (!tokens.has(token) && isInjectionToken(token)) {
      tokens.add(token)

      container.afterResolution(
        token as InjectionToken,
        (_, instance) => {
          if (!isInitialized(instance) && isInjectableClass(instance)) {
            const initializedInstance = initInstance(instance)
            onInstance(initializedInstance)
            return initInstance
          }
        },
        {
          frequency: 'Always',
        },
      )
    }

    return resolve.call(container, ...args)
  }

  return container
}
