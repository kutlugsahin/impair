import { RefObject, useContext, useMemo } from 'react'
import { DependencyContainer } from 'tsyringe'

import { createChildContainer } from '../../container/createChildContainer'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { provideMetadataKey } from '../../utils/symbols'
import { toReadonly } from '@vue/reactivity'

let currentComponentContainerRef: RefObject<DependencyContainer | undefined>

export function setCurrentComponentContainerRef(containerRef: RefObject<DependencyContainer | undefined>) {
  currentComponentContainerRef = containerRef
}

export function useViewModel<T extends Constructor, P extends object>(viewModel: T, props?: P): InstanceType<T> {
  const container = useContext(Context)

  if (currentComponentContainerRef && !currentComponentContainerRef.current) {
    currentComponentContainerRef.current = createChildContainer(container)
  }

  const componentContainer = currentComponentContainerRef.current!

  const viewModelProviders = useMemo(() => {
    const provided = Reflect.getMetadata(provideMetadataKey, viewModel) ?? []
    return [...provided, viewModel]
  }, [viewModel])

  useRegisteredContainer(props, viewModelProviders, componentContainer)

  return useMemo(() => {
    return toReadonly(componentContainer.resolve<InstanceType<T>>(viewModel)) as InstanceType<T>
  }, [componentContainer, viewModel])
}
