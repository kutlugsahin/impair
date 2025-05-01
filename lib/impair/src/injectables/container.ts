import { DependencyContainer } from 'tsyringe'

export class Container {
  constructor(private container: DependencyContainer) {
    this.resolve = this.container.resolve.bind(container)
    this.resolveAll = this.container.resolveAll.bind(container)
    this.register = this.container.register.bind(container)
    this.isRegistered = this.container.isRegistered.bind(container)
  }

  public resolve!: DependencyContainer['resolve']
  public resolveAll!: DependencyContainer['resolveAll']
  public register!: DependencyContainer['register']
  public isRegistered!: DependencyContainer['isRegistered']
}
