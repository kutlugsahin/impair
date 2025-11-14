import { DependencyContainer, InjectionToken, Lifecycle } from 'tsyringe'
import { createChildContainer } from '../container/createChildContainer'
import { initInstance } from '../container/initInstance'
import { Constructor, ServicePropsType } from '../types'
import { Props } from './tokens'

export class Container {
  constructor(private container: DependencyContainer) {
    this.resolve = this.resolve.bind(this)
    this.resolveAll = this.container.resolveAll.bind(container)
    this.register = this.container.register.bind(container)
    this.isRegistered = this.container.isRegistered.bind(container)
  }

  // Pass props to be injected as Props token
  // Passing props will create transient instance of the service

  public resolve<T extends Constructor>(token: T, props?: ServicePropsType<T>): InstanceType<T>
  public resolve<T>(token: InjectionToken): T
  public resolve<T extends InjectionToken>(token: T, props?: ServicePropsType<T>) {
    if (props != null && typeof token === 'function') {
      const childContainer = createChildContainer(this.container, initInstance)
      childContainer.register(token, { useClass: token }, { lifecycle: Lifecycle.Transient })
      childContainer.registerInstance(Props, props)
      return childContainer.resolve<T>(token)
    }

    return this.container.resolve<T>(token)
  }
  public resolveAll!: DependencyContainer['resolveAll']
  public register!: DependencyContainer['register']
  public isRegistered!: DependencyContainer['isRegistered']
}
