import { useMemo } from 'react'

import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { Constructor, Registration, ServicePropsType } from '../../types'
import { config } from '../../utils/config'
import { toReadOnlyService } from '../../utils/toReadOnlyService'
import { getCurrentComponentPropsRef } from '../current-component'

export function useResolve<T extends Constructor>(token: T): InstanceType<T>
export function useResolve<T extends Constructor>(token: T, props: ServicePropsType<T>): InstanceType<T>
export function useResolve(token: Constructor, props?: object) {
  const currentComponentPropsRef = getCurrentComponentPropsRef()

  if (!currentComponentPropsRef) {
    throw new Error('useResolve must be used within a component')
  }

  const provide: Registration[] = typeof token === 'function' ? [[token, 'transient']] : []

  const container = useRegisteredContainer({
    services: provide,
    props: props ?? currentComponentPropsRef.current,
  })

  return useMemo(() => {
    const instance = container.resolve(token)
    return config.readonlyProxiesForView ? toReadOnlyService(instance) : instance
  }, [container, token])
}
