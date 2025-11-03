import { DependencyContainer, InjectionToken, Lifecycle } from 'tsyringe'
import { Props } from './tokens'
import { Constructor } from 'src/types'
import { createChildContainer } from 'src/container/createChildContainer'
import { initInstance } from 'src/container/initInstance'

export class Container {
  constructor(private container: DependencyContainer) {
    this.resolve = this.resolve.bind(container)
    this.resolveAll = this.container.resolveAll.bind(container)
    this.register = this.container.register.bind(container)
    this.isRegistered = this.container.isRegistered.bind(container)
  }

  // Pass props to be injected as Props token
  // Passing props will create transient instance of the service
  public resolve<T extends InjectionToken>(token: T): T
  public resolve<T extends Constructor, P extends object>(token: T, props: P): InstanceType<T>
  public resolve<T extends InjectionToken, P extends object>(token: T, props?: P) {
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
