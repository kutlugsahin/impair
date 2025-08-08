import { useMemo } from 'react'

import { toReadOnlyService } from 'src/utils/toReadOnlyService'
import { InjectionToken } from 'tsyringe'
import { useDependencyContainer } from '../../context/context'
import { Constructor } from '../../types'
import { config } from '../../utils/config'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  const container = useDependencyContainer()

  return useMemo(() => {
    const instance = container.resolve(service)
    return config.readonlyProxiesForView ? toReadOnlyService(instance) : instance
  }, [service, container])
}
