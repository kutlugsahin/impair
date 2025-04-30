import { RefObject, useMemo } from 'react'
import { DependencyContainer } from 'tsyringe'

import { toReadonly } from '@vue/reactivity'
import { ViewProps } from 'src/injectables/tokens'
import { config } from 'src/utils/config'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { Constructor } from '../../types'
import { provideMetadataKey } from '../../utils/symbols'

let currentComponentContainerRef: RefObject<DependencyContainer | undefined> | undefined

export function setCurrentComponentContainerRef(containerRef: typeof currentComponentContainerRef) {
  currentComponentContainerRef = containerRef
}

export function useViewModel<T extends Constructor, P extends object>(viewModel: T, props?: P): InstanceType<T> {
  if (!currentComponentContainerRef) {
    throw new Error('useViewModel must be used within a component')
  }

  const viewModelProviders = useMemo(() => {
    const provided = Reflect.getMetadata(provideMetadataKey, viewModel) ?? []
    return [...provided, viewModel]
  }, [viewModel])

  useRegisteredContainer(props, viewModelProviders, currentComponentContainerRef, ViewProps)

  const componentContainer = currentComponentContainerRef.current!

  return useMemo(() => {
    const instance = componentContainer.resolve<InstanceType<T>>(viewModel)
    return config.readonlyProxiesForView ? (toReadonly(instance) as InstanceType<T>) : instance
  }, [componentContainer, viewModel])
}
