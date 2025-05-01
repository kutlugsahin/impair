import { useMemo } from 'react'

import { toReadonly } from '@vue/reactivity'
import { config } from 'src/utils/config'
import { InjectionToken } from 'tsyringe'
import { useDependencyContainer } from '../../context/context'
import { Constructor } from '../../types'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  const container = useDependencyContainer()

  return useMemo(() => {
    const instance = container.resolve(service)
    return config.readonlyProxiesForView ? toReadonly(instance) : instance
  }, [service, container])
}
