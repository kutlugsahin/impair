import { useMemo } from 'react'
import { InjectionToken } from 'tsyringe'

import { toReadonly } from '@vue/reactivity'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { ViewProps } from '../../injectables/tokens'
import { Constructor, Registration } from '../../types'
import { config } from '../../utils/config'
import { getCurrentComponentPropsRef } from '../current-component'

export function useResolve<T extends Constructor>(token: T): InstanceType<T>
export function useResolve<T>(token: InjectionToken): T
export function useResolve(token: InjectionToken) {
  const currentComponentPropsRef = getCurrentComponentPropsRef()

  if (!currentComponentPropsRef) {
    throw new Error('useResolve must be used within a component')
  }

  const provide: Registration[] = typeof token === 'function' ? [[token, 'transient']] : []

  const container = useRegisteredContainer(currentComponentPropsRef?.current, provide, undefined, ViewProps)

  return useMemo(() => {
    const instance = container.resolve(token)
    return config.readonlyProxiesForView ? toReadonly(instance) : instance
  }, [container, token])
}
