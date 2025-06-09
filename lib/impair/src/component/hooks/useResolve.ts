import { useMemo } from 'react'

import { toReadonly } from '@vue/reactivity'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { Constructor, Registration } from '../../types'
import { config } from '../../utils/config'
import { getCurrentComponentPropsRef } from '../current-component'

export function useResolve<T extends Constructor>(token: T): InstanceType<T>
export function useResolve<T extends Constructor>(token: T, props: object): InstanceType<T>
export function useResolve(token: Constructor, props?: object) {
  const currentComponentPropsRef = getCurrentComponentPropsRef()

  if (!currentComponentPropsRef) {
    throw new Error('useResolve must be used within a component')
  }

  const provide: Registration[] = typeof token === 'function' ? [[token, 'transient']] : []

  const container = useRegisteredContainer({
    services: provide,
    viewProps: currentComponentPropsRef.current,
    props,
  })

  return useMemo(() => {
    const instance = container.resolve(token)
    return config.readonlyProxiesForView ? toReadonly(instance) : instance
  }, [container, token])
}
