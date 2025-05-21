import { useMemo } from 'react'

import { toReadonly } from '@vue/reactivity'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { ViewProps } from '../../injectables/tokens'
import { Constructor } from '../../types'
import { config } from '../../utils/config'
import { provideMetadataKey } from '../../utils/symbols'
import { getCurrentComponentContainerRef, getCurrentComponentPropsRef } from '../current-component'

export function useViewModel<T extends Constructor>(viewModel: T): InstanceType<T> {
  const currentComponentContainerRef = getCurrentComponentContainerRef()
  const currentComponentPropsRef = getCurrentComponentPropsRef()

  if (!currentComponentContainerRef || !currentComponentPropsRef) {
    throw new Error('useViewModel must be used within a component')
  }

  const viewModelProviders = useMemo(() => {
    const provided = Reflect.getMetadata(provideMetadataKey, viewModel) ?? []
    return [...provided, viewModel]
  }, [viewModel])

  useRegisteredContainer(currentComponentPropsRef.current, viewModelProviders, currentComponentContainerRef, ViewProps)

  const componentContainer = currentComponentContainerRef.current!

  return useMemo(() => {
    const instance = componentContainer.resolve<InstanceType<T>>(viewModel)
    return config.readonlyProxiesForView ? (toReadonly(instance) as InstanceType<T>) : instance
  }, [componentContainer, viewModel])
}
