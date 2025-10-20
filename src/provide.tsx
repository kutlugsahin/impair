import { inject, injectable, provide, state, useService, componentWithServices } from 'impair'

@injectable()
class Counter {
  @state
  count = 2

  constructor() {
    console.log('Counter initialized')
  }

  inc() {
    this.count++
  }
}

@provide([[Counter, 'transient']])
@injectable()
export class SelfService {
  constructor(@inject(Counter) public counterService: Counter, @inject(Counter) public counterService2: Counter) {}
}

const component = componentWithServices(SelfService)

export const App = component(() => {
  const { counterService, counterService2 } = useService(SelfService)
  // const { counterService2 } = useService(SelfService)

  return (
    <div>
      <button onClick={() => counterService.inc()}>{counterService.count}</button>
      <button onClick={() => counterService2.inc()}>{counterService2.count}</button>
    </div>
  )
})
