import { useEffect } from 'react'
import type { DependencyContainer } from 'tsyringe'

import { getOnMountMethods } from 'impair/lifecycle/onMount'
import { getOnUnmountMethods } from 'impair/lifecycle/onUnmount'
import type { ServiceInstance } from '../types'
import { isMounted } from '../utils/symbols'

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
      container.dispose()
    }
  }, [container])

  return resolvedServices
}
