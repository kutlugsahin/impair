import { FC, ReactElement } from 'react'
import type { ClassProvider, FactoryProvider, InjectionToken, TokenProvider, ValueProvider } from 'tsyringe'

import { DelayedConstructor } from 'tsyringe/dist/typings/lazy-helpers'
import type { isInitialized, isLifecycleHandled } from './utils/symbols'

export type Constructor<T = any> = new (...args: any[]) => T

export type InstanceLifecycle = 'singleton' | 'transient' | 'container' | 'resolution'

export type RegistrationObject<T = any> =
  | {
      token: InjectionToken<T>
      provider: ClassProvider<T>
      lifecycle: InstanceLifecycle
    }
  | {
      token: InjectionToken<T>
      provider: FactoryProvider<T> | ValueProvider<T> | TokenProvider<T>
    }

export type Registration =
  | Constructor
  | RegistrationObject
  | [Constructor, InstanceLifecycle]
  | [InjectionToken, ClassProvider<any>['useClass']]
  | [InjectionToken, ClassProvider<any>['useClass'], InstanceLifecycle]
  /**
   * Must be a plain js object
   * Given object will be provided as a shallow reactive object with the given injection token
   * Changes in the object properties will be reflected as reactive properties
   */
  | [InjectionToken, object]

export type ProviderProps<P extends object = object> = {
  provide: Registration[]
  props?: P

  /**
   * Normally provided services are created lazily when they are first resolved.
   * If this option is set to true, all provided singleton services will be created immediately.
   */
  initializeSingletons?: boolean
}

export type Registrations = ProviderProps['provide']

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

export type ReactiveComponent<P extends object> = FC<P> & {
  provide: (...args: Registrations) => FC<P>
}

export interface ServiceProps<P extends object = object> {
  props: P
}

export type ServicePropsType<T extends InjectionToken, TDefault = any> = T extends Constructor
  ? InstanceType<T> extends ServiceProps<infer P>
    ? P
    : TDefault
  : TDefault

export type TokenResolve<T extends InjectionToken> = T extends Constructor<infer U>
  ? U
  : T extends DelayedConstructor<infer U2>
  ? U2
  : any
