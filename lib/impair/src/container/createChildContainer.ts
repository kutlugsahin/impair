import { DependencyContainer, InjectionToken } from 'tsyringe'

import { injectableMetadataKey } from '../utils/symbols'
import { initInstance, isInitialized } from './initInstance'

const symbol_parentContainer = Symbol.for('tsyringe.DependencyContainer.parentContainer')

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
  const container = extendsDependencyContainer(parentContainer.createChildContainer())

  container.setParentContainer(parentContainer)

  const resolve = container.resolve

  const containerTokenRegistry = new Map<DependencyContainer, Set<InjectionToken>>()

  container.resolve = function <T>(...args: [InjectionToken<T>]): T {
    const token = args[0]

    if (isInjectionToken(token) && !container.isRegistered(token)) {
      const registeredContainer = findRegisteredParentContainer(container, token)
      if (registeredContainer) {
        return registeredContainer.resolve.call(registeredContainer, ...args) as T
      }
    }

    if (!containerTokenRegistry.has(container)) {
      containerTokenRegistry.set(container, new Set<InjectionToken>())
    }

    const tokens = containerTokenRegistry.get(container)!

    if (!tokens.has(token) && isInjectionToken(token)) {
      tokens.add(token)

      container.afterResolution(
        token as InjectionToken,
        (_, instance) => {
          if (!isInitialized(instance) && isInjectableClass(instance)) {
            const initializedInstance = initInstance(instance)
            onInstance(initializedInstance)
          }
        },
        {
          frequency: 'Always',
        },
      )
    }

    return resolve.call(container, ...args) as T
  }

  return container
}

function extendsDependencyContainer(container: DependencyContainer): DependencyContainer {
  if (!container.getParentContainer) {
    container.getParentContainer = function (this): DependencyContainer | undefined {
      return (container as any)[symbol_parentContainer]
    }
  }

  if (!container.setParentContainer) {
    container.setParentContainer = function (parent: DependencyContainer): void {
      ;(container as any)[symbol_parentContainer] = parent
    }
  }

  return container
}

function findRegisteredParentContainer(container: DependencyContainer, token: InjectionToken) {
  if (container.isRegistered(token)) {
    return container
  }

  const parentContainer = container.getParentContainer?.()
  if (parentContainer) {
    return findRegisteredParentContainer(parentContainer, token)
  }

  return undefined
}
