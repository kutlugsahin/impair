import { shallowReactive } from '@vue/reactivity'
import { useState, useMemo, useEffect } from 'react'
import { ProviderProps, Registration } from '../types'
import { isPlainObject } from './object'
import { useIsRegistrationStableRef } from './useIsRegistrationStableRef'
import { updateObjectProps } from './updateObjectProps'

export function useRegistrations(registrations: ProviderProps['provide']): Registration[] {
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
