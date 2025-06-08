import { Registration } from 'src/types'
import { ClassProvider } from 'tsyringe'

/**
 * Normally Service providers assumed to be stable array of registration.
 * But in some cases like HMR, service classes can be changed.
 * This function creates a dependency array to determine if the container needs to be re created
 */
export function getRegistrationDependencyArray(registrations: Registration[]) {
  const depsArray = []

  for (const registration of registrations) {
    if (typeof registration === 'function') {
      depsArray.push(registration)
    } else if (Array.isArray(registration)) {
      depsArray.push(...registration)
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
