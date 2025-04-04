import { useContext } from 'react'

import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { InjectionToken } from 'tsyringe'

export function useService<T extends Constructor>(service: T): InstanceType<T>
export function useService<T>(token: InjectionToken): T
export function useService(service: InjectionToken) {
  return useContext(Context).resolve(service)
}
