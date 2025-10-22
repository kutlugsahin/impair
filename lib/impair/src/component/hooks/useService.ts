import { useMemo } from 'react'

import { InjectionToken } from 'tsyringe'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { useDependencyContainer } from '../../context/context'
import { Constructor } from '../../types'
import { config } from '../../utils/config'
import { toReadOnlyService } from '../../utils/toReadOnlyService'
import { useDecoratedProviders } from '../../utils/useDecoratedProviders'

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
    const instance = registeredContainer.resolve(service)
    return config.readonlyProxiesForView ? toReadOnlyService(instance) : instance
  }, [service, registeredContainer])
}
