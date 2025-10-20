import { useMemo } from 'react'

import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { findRegisteredParentContainer } from '../../utils/container'
import { injectableMetadataKey } from '../../utils/symbols'
import { useDecoratedProviders } from '../../utils/useDecoratedProviders'
import { InjectionToken } from 'tsyringe'
import { useDependencyContainer } from '../../context/context'
import { Constructor } from '../../types'
import { config } from '../../utils/config'
import { toReadOnlyService } from '../../utils/toReadOnlyService'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  const container = useDependencyContainer()

  const serviceProviders = useDecoratedProviders(service, false)

  const registeredContainer = useRegisteredContainer({
    services: serviceProviders,
    sharedContainerRef: {
      current: container,
    },
  })

  return useMemo(() => {
    const isRegistered = findRegisteredParentContainer(registeredContainer, service)

    if (!isRegistered) {
      if (typeof service === 'function') {
        const scope = Reflect.getMetadata(injectableMetadataKey, service)

        if (scope === 'global') {
          registeredContainer.registerSingleton(service)
        }
      }
    }

    const instance = registeredContainer.resolve(service)
    return config.readonlyProxiesForView ? toReadOnlyService(instance) : instance
  }, [service, registeredContainer])
}
