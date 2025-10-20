import { useMemo } from 'react'
import { InjectionToken } from 'tsyringe'
import { provideMetadataKey } from './symbols'

export function useDecoratedProviders<T extends InjectionToken>(service: T, includeSelf: boolean = true) {
  return useMemo(() => {
    const provided = Reflect.getMetadata(provideMetadataKey, service) ?? []
    return includeSelf ? [...provided, service] : provided
  }, [service, includeSelf])
}
