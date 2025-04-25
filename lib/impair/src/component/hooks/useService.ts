import { useContext } from 'react'

import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { InjectionToken } from 'tsyringe'
import { type DeepReadonly } from '@vue/reactivity'

export function useService<T extends Constructor>(service: T): DeepReadonly<InstanceType<T>>
export function useService<T>(token: InjectionToken): DeepReadonly<T>
export function useService(service: InjectionToken) {
  return useContext(Context).resolve(service)
}
