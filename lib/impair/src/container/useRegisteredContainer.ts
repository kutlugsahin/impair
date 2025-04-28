import { useContext, useMemo } from 'react'
import { DependencyContainer } from 'tsyringe'

import { createChildContainer } from './createChildContainer'
import { Context } from '../context/context'
import { Container } from '../injectables/container'
import { Props } from '../injectables/tokens'
import { ProviderProps } from '../types'
import { useReactiveProps } from '../utils/useReactiveProps'
import { registerServices } from './registerServices'
import { useHandleLifecycle } from './useHandleLifecycle'

export function useRegisteredContainer<P>(
  props: P,
  services: ProviderProps<any>['provide'],
  existingContainer?: DependencyContainer,
  propsToken = Props,
) {
  const parentContainer = useContext(Context)

  const mappedProps = useReactiveProps(props ?? {})

  const registerProps = props != null

  const { container, resolvedServices } = useMemo(() => {
    const container = existingContainer ?? createChildContainer(parentContainer)

    if (!container.isRegistered(Container)) {
      container.register(Container, {
        useValue: new Container(container),
      })
    }

    if (registerProps && !container.isRegistered(propsToken)) {
      container.register(propsToken, {
        useValue: mappedProps,
      })
    }

    const resolvedServices = registerServices(container, services)

    return {
      container,
      resolvedServices,
    }
    // exclude registerProps from the dependency array
    // only consider the first value of props to decide register
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingContainer, parentContainer])

  useHandleLifecycle(container, resolvedServices)

  return container
}
