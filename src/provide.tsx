import { component, derived, inject, injectable, provide, state, useService, useViewModel } from 'impair'

@injectable()
class Counter {
  @state
  count = 3

  constructor() {
    console.log('Counter initialized')
  }

  inc() {
    this.count++
  }
}

@provide([[Counter, 'resolution']])
@injectable()
export class SelfService {
  constructor(@inject(Counter) public c1: Counter, @inject(Counter) public c2: Counter) {}
}

export const App = component(function AppFeature() {
  const s1 = useService(SelfService)
  const s2 = useService(SelfService)

  return (
    <div>
      <div>
        <button onClick={() => s1.c1.inc()}>{s1.c1.count}</button>
        <button onClick={() => s1.c2.inc()}>{s1.c2.count}</button>
      </div>
      <div>
        <button onClick={() => s2.c1.inc()}>{s2.c1.count}</button>
        <button onClick={() => s2.c2.inc()}>{s2.c2.count}</button>
      </div>
      <div>
        <CounterComponent />
        <CounterWithViewModel />
      </div>
    </div>
  )
}).provide(SelfService)

const CounterComponent = component(function CounterComponent() {
  const counter = useViewModel(Counter)

  return (
    <div>
      <button onClick={() => counter.inc()}>{counter.count}</button>
    </div>
  )
})

@provide([[Counter, 'transient']])
@injectable()
class CounterViewModel {
  constructor(@inject(SelfService) public selfService: SelfService) {}

  @derived
  get counter() {
    return this.selfService.c1
  }

  render() {
    return (
      <div>
        <button onClick={() => this.counter.inc()}>{this.counter.count}</button>
      </div>
    )
  }
}

const CounterWithViewModel = component.fromViewModel(CounterViewModel)
