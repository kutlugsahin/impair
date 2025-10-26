import { provideMetadataKey } from '../utils/symbols'
import { Constructor, ProviderProps } from '../types'
import { InjectionToken } from 'tsyringe'

export function provide(registrations: ProviderProps<any>['provide']) {
  return function <T extends Constructor>(target: T) {
    Reflect.metadata(provideMetadataKey, registrations)(target)
  }
}

export function getDecoratedProviders<T extends InjectionToken>(service: T, includeSelf: boolean = true) {
  if (typeof service === 'function') {
    const provided = Reflect.getMetadata(provideMetadataKey, service) ?? []
    return includeSelf ? [...provided, service] : provided
  }

  return []
}
