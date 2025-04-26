import { useContext, useMemo } from 'react'

import { InjectionToken } from 'tsyringe'
import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { toReadonly } from '@vue/reactivity'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  const container = useContext(Context)

  return useMemo(() => {
    return toReadonly(container.resolve(service))
  }, [service, container])
}
