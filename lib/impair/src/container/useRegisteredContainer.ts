import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { useDependencyContainer } from '../context/context'
import { Container } from '../injectables/container'
import { Props, ViewProps } from '../injectables/tokens'
import { Dispose, Registration } from '../types'
import { useReactiveObject } from '../utils/useReactiveObject'
import { createChildContainer } from './createChildContainer'
import { disposeContainer } from './dispose'
import { handleOnMounts } from './handleLifecycle'
import { registerServices } from './registerServices'

export function useRegisteredContainer(
  services: Registration[],
  sharedContainerRef?: RefObject<DependencyContainer | undefined>,
  props?: object,
  viewProps?: object,
) {
  const parentContainer = useDependencyContainer()
  const [resolvedInstances] = useState(() => new Set())
  const [disposers] = useState(() => new Set<Dispose | undefined>())
  const isMounted = useRef(false)

  const mappedProps = useReactiveObject(props)
  const mappedViewProps = useReactiveObject(viewProps)

  const registerProps = props != null
  const registerViewProps = viewProps != null

  const container = useMemo(() => {
    if (sharedContainerRef?.current) {
      registerServices(sharedContainerRef.current, services)
      return sharedContainerRef.current
    }

    const container = createChildContainer(parentContainer, (instance) => {
      resolvedInstances.add(instance)
      if (isMounted.current) {
        disposers.add(handleOnMounts(instance))
      }
    })

    if (!container.isRegistered(Container)) {
      container.register(Container, {
        useValue: new Container(container),
      })
    }

    if (registerProps && !container.isRegistered(Props)) {
      container.register(Props, {
        useValue: mappedProps,
      })
    }

    if (registerViewProps && !container.isRegistered(ViewProps)) {
      container.register(ViewProps, {
        useValue: mappedViewProps,
      })
    }

    registerServices(container, services)

    if (sharedContainerRef) {
      sharedContainerRef.current = container
    }

    return container

    // exclude registerProps from the dependency array
    // only consider the first value of props to decide register
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedContainerRef?.current, parentContainer])

  useEffect(() => {
    isMounted.current = true

    resolvedInstances.forEach((instance) => {
      disposers.add(handleOnMounts(instance))
    })

    return () => {
      disposers.forEach((dispose) => {
        dispose?.()
      })

      disposeContainer(container)
      isMounted.current = false
      resolvedInstances.clear()
      disposers.clear()
    }
  }, [container, disposers, resolvedInstances])

  return container
}
