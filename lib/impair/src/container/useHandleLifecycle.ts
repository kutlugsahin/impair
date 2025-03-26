import { useEffect } from 'react'
import type { DependencyContainer } from 'tsyringe'

import { getOnMountMethods } from '../lifecycle/onMount'
import { getOnUnmountMethods } from '../lifecycle/onUnmount'
import type { ServiceInstance } from '../types'
import { isMounted } from '../utils/symbols'
import { disposeContainer } from './dispose'

export function useHandleLifecycle(container: DependencyContainer, resolvedServices: Set<ServiceInstance>) {
  useEffect(() => {
    const disposers = [...resolvedServices].map((service) => {
      if (!service[isMounted]) {
        service[isMounted] = true

        const onMounts = getOnMountMethods(service)

        const onMountDisposers = onMounts.map((onMount) => onMount()).filter((p) => typeof p === 'function')

        return () => {
          if (service[isMounted]) {
            service[isMounted] = false
            const onUnmounts = getOnUnmountMethods(service)
            onUnmounts.concat(onMountDisposers).forEach((dispose) => dispose())
          }
        }
      }
    })

    return () => {
      disposers.forEach((dispose) => {
        dispose?.()
      })
      disposeContainer(container)
    }
  }, [container])

  return resolvedServices
}
