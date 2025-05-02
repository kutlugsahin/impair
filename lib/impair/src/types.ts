import { ReactElement } from 'react'
import type { ClassProvider, FactoryProvider, InjectionToken, TokenProvider, ValueProvider } from 'tsyringe'

import type { isLifecycleHandled, isInitialized } from './utils/symbols'

export type Constructor<T = any> = new (...args: any[]) => T

export type InstanceLifecycle = 'singleton' | 'transient' | 'container' | 'resolution'

export type RegistrationObject<T = any> =
  | {
      token: InjectionToken<T>
      provider: ClassProvider<T> | TokenProvider<T>
      lifecycle: InstanceLifecycle
    }
  | {
      token: InjectionToken<T>
      provider: FactoryProvider<T> | ValueProvider<T>
    }

export type Registration =
  | Constructor
  | RegistrationObject
  | [Constructor, InstanceLifecycle]
  | [InjectionToken, ClassProvider<any>['useClass']]
  | [InjectionToken, ClassProvider<any>['useClass'], InstanceLifecycle]

export type ProviderProps<P extends object> = {
  provide: Registration[]
  props?: P
}

export type Dispose = () => void

export type ServiceInstance = {
  [isInitialized]: boolean
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
