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

/**
 * Must be a plain js object
 * Given object will be provided as a shallow reactive object with the given injection token
 * Changes in the object properties will be reflected as reactive properties
 */
export type ReactiveObjectRegistration = [InjectionToken, object]

export type Registration =
  | Constructor
  | RegistrationObject
  | [Constructor, InstanceLifecycle]
  | [InjectionToken, ClassProvider<any>['useClass']]
  | [InjectionToken, ClassProvider<any>['useClass'], InstanceLifecycle]

export type ProviderProps<P extends object = object> = {
  provide: (Registration | ReactiveObjectRegistration)[]
  props?: P

  /**
   * Normally provided services are created lazily when they are first resolved.
   * If this option is set to true, all provided singleton services will be created immediately.
   */
  initializeSingletons?: boolean
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
