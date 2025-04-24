import { ReactElement } from 'react'
import type { ClassProvider, FactoryProvider, InjectionToken, TokenProvider, ValueProvider } from 'tsyringe'

import type { isLifecycleHandled, isMounted } from './utils/symbols'

export type Constructor<T = any> = new (...args: any[]) => T

export type InstanceLifecycle = 'singleton' | 'transient' | 'container' | 'resolution'

export type Provider<T = any> =
  | ValueProvider<T>
  | ClassProvider<T>
  | FactoryProvider<T>
  | TokenProvider<T>
  | Constructor<T>

export type Registration<T = any> = {
  token: InjectionToken<T>
  provider: Provider<T>
  lifecycle: InstanceLifecycle
}

export type ProviderProps<P extends object> = {
  readonly provide: readonly (
    | Constructor
    | Registration
    | [Constructor, InstanceLifecycle]
    | [InjectionToken, ClassProvider<any>['useClass']]
    | [InjectionToken, ClassProvider<any>['useClass'], InstanceLifecycle]
  )[]
  props?: P
}

export type Dispose = () => void

export type ServiceInstance = {
  [isMounted]: boolean
  [isLifecycleHandled]: boolean
}

export type Dictionary<T = any> = {
  [key: string]: T
}

export interface RendererViewModel {
  render(): ReactElement | null
}

export type EffectCallback = (cleanup: TriggerCleanup) => void

export type Cleanup = () => void
export type TriggerCleanup = (cleanup: () => void) => void
