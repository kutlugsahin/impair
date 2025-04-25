import { useContext } from 'react'

import { InjectionToken } from 'tsyringe'
import { Context } from '../../context/context'
import { Constructor } from '../../types'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  return useContext(Context).resolve(service)
}
