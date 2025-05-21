import { DependencyContainer, Lifecycle } from 'tsyringe'

import { InstanceLifecycle, ProviderProps, Registration, RegistrationObject } from '../types'

function toLifecycle(lifecycle: InstanceLifecycle): Lifecycle {
  switch (lifecycle) {
    case 'singleton':
      return Lifecycle.Singleton
    case 'transient':
      return Lifecycle.Transient
    case 'container':
      return Lifecycle.ContainerScoped
    case 'resolution':
      return Lifecycle.ResolutionScoped
    default:
      throw new Error('Invalid lifecycle')
  }
}

function getRegistrationOptions(registration: Registration): RegistrationObject & { lifecycle?: InstanceLifecycle } {
  /**
   * If the registration is a function,
   * it means that it is a class to be registered as singleton
   */
  if (typeof registration === 'function') {
    const serviceClass = registration
    return {
      token: serviceClass,
      provider: {
        useClass: serviceClass,
      },
      lifecycle: 'singleton',
    }
  }

  /**
   * The registration is [token, class, lifecycle] or [class, lifecycle],
   */
  if (Array.isArray(registration)) {
    if (typeof registration[1] === 'string') {
      const [serviceClass, lifecycle] = registration
      return {
        token: serviceClass,
        provider: {
          useClass: serviceClass,
        },
        lifecycle,
      }
    }

    const [serviceToken, providedClass, lifecycle = 'singleton'] = registration
    return {
      token: serviceToken,
      provider: {
        useClass: providedClass,
      },
      lifecycle,
    }
  }

  /**
   * If the registration is an object,
   * it means that it is a custom registration
   */
  if (typeof registration === 'object') {
    return registration
  }

  throw new Error('Invalid service provider registration')
}

export function registerServices(container: DependencyContainer, services: ProviderProps<any>['provide']) {
  services.forEach((serviceInfo) => {
    const { provider, token, lifecycle } = getRegistrationOptions(serviceInfo)

    if (!container.isRegistered(token)) {
      container.register(
        token,
        provider as any,
        lifecycle
          ? {
            lifecycle: toLifecycle(lifecycle),
          }
          : undefined,
      )
    }
  })
}
