import { getOnMountMethods } from '../lifecycle/onMount'
import { getOnUnmountMethods } from '../lifecycle/onUnmount'
import type { Cleanup, Dispose } from '../types'
import { isLifecycleHandled } from '../utils/symbols'

export function handleOnMounts(service: any): Dispose | undefined {
  if (!service[isLifecycleHandled]) {
    service[isLifecycleHandled] = true

    const onMounts = getOnMountMethods(service)

    const onMountDisposers = onMounts.map((onMount) => {
      let cleanup: (() => void) | undefined

      onMount((clb: Cleanup) => {
        cleanup = clb
      })

      return () => {
        cleanup?.()
      }
    })

    return () => {
      if (service[isLifecycleHandled]) {
        service[isLifecycleHandled] = false
        const onUnmounts = getOnUnmountMethods(service)
        onUnmounts.concat(onMountDisposers).forEach((dispose) => dispose())
      }
    }
  }
}
