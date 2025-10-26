import { useRef } from 'react'
import { ClassProvider } from 'tsyringe'
import { Registrations } from '../types'
import { isPlainObject } from './object'

/**
 * Normally Service providers assumed to be stable array of registration.
 * But in some cases like HMR, service classes can be changed.
 * This function creates a dependency array to determine if the container needs to be re created
 */
function getRegistrationDependencyArray(registrations: Registrations) {
  const depsArray = []

  for (const registration of registrations) {
    if (typeof registration === 'function') {
      depsArray.push(registration)
    } else if (Array.isArray(registration)) {
      depsArray.push(...registration.filter((val) => !isPlainObject(val)))
    } else {
      depsArray.push(registration.token)
      if (registration.provider) {
        const provider = registration.provider as ClassProvider<any>

        if (provider.useClass) {
          depsArray.push(provider.useClass)
        }
      }
    }
  }

  return depsArray
}

/**
 * This hook returns a stable reference object that can be used to determine
 * if the registrations have changed.
 */
export function useIsRegistrationStableRef(registrations: Registrations) {
  const prevDepsArray = useRef<unknown[]>([])
  const stableRef = useRef({})

  const depsArray = getRegistrationDependencyArray(registrations)

  if (
    depsArray.length !== prevDepsArray.current.length ||
    depsArray.some((dep, index) => dep !== prevDepsArray.current[index])
  ) {
    prevDepsArray.current = depsArray
    stableRef.current = {}
  }

  return stableRef.current
}
