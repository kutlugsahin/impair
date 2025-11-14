import { useMemo } from 'react'

import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { Constructor } from '../../types'
import { config } from '../../utils/config'
import { toReadOnlyService } from '../../utils/toReadOnlyService'
import { getCurrentComponentContainerRef, getCurrentComponentPropsRef } from '../current-component'

export function useViewModel<T extends Constructor>(viewModel: T): InstanceType<T> {
  const currentComponentContainerRef = getCurrentComponentContainerRef()
  const currentComponentPropsRef = getCurrentComponentPropsRef()

  if (!currentComponentContainerRef || !currentComponentPropsRef) {
    throw new Error('useViewModel must be used within a component')
  }

  const container = useRegisteredContainer({
    services: [viewModel],
    props: currentComponentPropsRef.current,
    sharedContainerRef: currentComponentContainerRef,
  })

  return useMemo(() => {
    const instance = container.resolve<InstanceType<T>>(viewModel)
    return config.readonlyProxiesForView ? (toReadOnlyService(instance) as InstanceType<T>) : instance
  }, [container, viewModel])
}
