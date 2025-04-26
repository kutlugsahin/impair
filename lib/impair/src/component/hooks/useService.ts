import { useContext, useMemo } from 'react'

import { InjectionToken } from 'tsyringe'
import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { toReadonly } from '@vue/reactivity'
import { config } from 'src/utils/config'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  const container = useContext(Context)

  return useMemo(() => {
    const instance = container.resolve(service)
    return config.readonlyProxiesForView ? toReadonly(instance) : instance
  }, [service, container])
}
