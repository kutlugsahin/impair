import { DependencyContainer, InjectionToken, container as tsyringeRootContainer } from 'tsyringe'

const symbol_parentContainer = Symbol.for('tsyringe.DependencyContainer.parentContainer')

export function extendsDependencyContainer(container: DependencyContainer): DependencyContainer {
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

export function findRegisteredParentContainer(container: DependencyContainer, token: InjectionToken) {
  if (container.isRegistered(token)) {
    return container
  }

  const parentContainer = container.getParentContainer?.()
  if (parentContainer && parentContainer !== tsyringeRootContainer) {
    return findRegisteredParentContainer(parentContainer, token)
  }

  return undefined
}
