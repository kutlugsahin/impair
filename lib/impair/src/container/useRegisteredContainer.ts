import { RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { Context } from '../context/context'
import { Container } from '../injectables/container'
import { Props } from '../injectables/tokens'
import { Dispose, ProviderProps } from '../types'
import { useReactiveProps } from '../utils/useReactiveProps'
import { createChildContainer } from './createChildContainer'
import { disposeContainer } from './dispose'
import { handleOnMounts } from './handleLifecycle'
import { registerServices } from './registerServices'

export function useRegisteredContainer<P>(
  props: P,
  services: ProviderProps<any>['provide'],
  sharedContainerRef?: RefObject<DependencyContainer | undefined>,
  propsToken = Props,
) {
  const parentContainer = useContext(Context)
  const [resolvedInstances] = useState(() => new Set<any>())
  const [disposers] = useState(() => new Set<Dispose | undefined>())
  const isMounted = useRef(false)

  const mappedProps = useReactiveProps(props ?? {})

  const registerProps = props != null

  const container = useMemo(() => {
    let container!: DependencyContainer

    if (!sharedContainerRef || !sharedContainerRef.current) {
      container = createChildContainer(parentContainer, (instance) => {
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

      if (registerProps && !container.isRegistered(propsToken)) {
        container.register(propsToken, {
          useValue: mappedProps,
        })
      }

      registerServices(container, services)

      if (sharedContainerRef) {
        sharedContainerRef.current = container
      }
    } else {
      container = sharedContainerRef.current
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
      resolvedInstances.clear()
    }
  }, [container, disposers, resolvedInstances])

  return container
}
