import { shallowReactive } from '@vue/reactivity'
import { useEffect, useMemo, useState } from 'react'
import { Registration, Registrations } from '../types'
import { isPlainObject } from './object'
import { updateObjectProps } from './updateObjectProps'
import { useIsRegistrationStableRef } from './useIsRegistrationStableRef'

/**
 * Produce a stable array ref of registrations from the provided services.
 * Detects HMR Instance replacement and updates accordingly.
 *
 * Also handles [token, object] registrations by converting the object into a shallow reactive object to be injected
 */
export function useRegistrations(registrations: Registrations): Registration[] {
  const [mappedPropArr] = useState<object[]>([])

  const registrationStability = useIsRegistrationStableRef(registrations)

  const result = useMemo(() => {
    return registrations.map((registration, index) => {
      if (Array.isArray(registration) && isPlainObject(registration[1])) {
        mappedPropArr[index] = shallowReactive(registration[1])

        return {
          token: registration[0],
          provider: {
            useValue: mappedPropArr[index],
          },
        }
      }

      return registration as Registration
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedPropArr, registrationStability])

  useEffect(() => {
    registrations.forEach((registration, index) => {
      if (Array.isArray(registration) && isPlainObject(registration[1])) {
        const mappedProps = mappedPropArr[index]

        if (mappedProps) {
          updateObjectProps(mappedProps, registration[1])
        }
      }
    })
  }, [mappedPropArr, registrations])

  return result
}
