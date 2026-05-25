import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { useDependencyContainer } from '../context/context'
import { Container } from '../injectables/container'
import { Props } from '../injectables/tokens'
import { Dispose, Registration, Registrations } from '../types'
import { useReactiveObject } from '../utils/useReactiveObject'
import { useRegistrations } from '../utils/useRegistrations'
import { useStrictModeIntegrity } from '../utils/useStrictModeIntegrity'
import { createChildContainer } from './createChildContainer'
import { disposeContainer, isDisposed } from './dispose'
import { getDevtoolsHook } from '../devtools/hook'
import { handleOnMounts } from './handleLifecycle'
import { registerServices } from './registerServices'

type RegisteredContainerParams = {
  services: Registrations
  sharedContainerRef?: RefObject<DependencyContainer | undefined>
  props?: object

  initializeSingletons?: boolean
}

export function useRegisteredContainer({
  services,
  sharedContainerRef,
  props,

  initializeSingletons,
}: RegisteredContainerParams) {
  const parentContainer = useDependencyContainer()
  const [resolvedInstances] = useState(() => new Set())
  const [disposers] = useState(() => new Set<Dispose | undefined>())
  const isMounted = useRef(false)
  const prevRegistrationsRef = useRef<Registration[] | undefined>(undefined)

  const mappedProps = useReactiveObject(props)

  const registerProps = props != null

  const registrations = useRegistrations(services)

  const strictModeIntegrity = useStrictModeIntegrity()

  const { container } = useMemo(() => {
    const sharedContainer = sharedContainerRef?.current
    const registrationsChanged =
      prevRegistrationsRef.current !== undefined && prevRegistrationsRef.current !== registrations

    if (sharedContainer && !isDisposed(sharedContainer)) {
      if (!registrationsChanged) {
        registerServices(sharedContainer, registrations, initializeSingletons)
        prevRegistrationsRef.current = registrations

        return {
          container: sharedContainer,
          disposers,
        }
      }

      // Registrations changed while a shared container is still alive (typically an HMR class
      // identity swap). Tear the shared container down so we don't end up with both the old
      // class registration (stale instance, still-running triggers) and the new one co-existing.
      disposers.forEach((dispose) => {
        dispose?.()
      })
      disposers.clear()
      resolvedInstances.clear()
      disposeContainer(sharedContainer)
      getDevtoolsHook()?.unregisterContainer(sharedContainer)
      sharedContainerRef!.current = undefined
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

    registerServices(container, registrations, initializeSingletons)

    if (sharedContainerRef) {
      sharedContainerRef.current = container
    }

    prevRegistrationsRef.current = registrations

    return { container, disposers }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentContainer, resolvedInstances, sharedContainerRef?.current, registrations, strictModeIntegrity])

  useEffect(() => {
    isMounted.current = true

    resolvedInstances.forEach((instance) => {
      disposers.add(handleOnMounts(instance))
    })

    return () => {
      disposers.forEach((dispose) => {
        dispose?.()
      })

      if (container) {
        disposeContainer(container)
        getDevtoolsHook()?.unregisterContainer(container)
      }

      isMounted.current = false
      resolvedInstances.clear()
      disposers.clear()
    }
  }, [disposers, resolvedInstances, container])

  return container
}
