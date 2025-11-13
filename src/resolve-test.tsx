import {
  component,
  Container,
  derived,
  inject,
  injectable,
  onMount,
  Props,
  ServiceProvider,
  state,
  useResolve,
  useService,
  useViewModel,
} from 'impair/index'
import { createRef } from 'react'
import { container } from 'tsyringe'

@injectable()
class Counter {
  constructor(@inject(Props) public props: { id: number }) {
    this.count = props.id
  }

  @state
  count = 0
}

@injectable()
class Counter2 {
  constructor(@inject(Props) public props: { id: number }, @inject(Counter) public counter: Counter) {
    this.count = props.id + counter.count
  }

  @state
  count = 0
}

@injectable()
class CounterService {
  constructor(@inject(Counter) public counter: Counter) {}

  @derived
  get count() {
    return this.counter.count * 2
  }

  set count(value: number) {
    this.counter.count = value / 2
  }
}

export function ResolveTest() {
  return (
    <div>
      <ServiceProvider initializeSingletons provide={[Counter]} props={{ id: 5 }}>
        {/* <ServiceProvider provide={[Counter2]} props={{ id: 1 }}>
          <CounterView />
          <CounterView />
        </ServiceProvider> */}
        <CounterView />
        <CounterView />
      </ServiceProvider>
      {/* <hr />
      <ServiceProvider provide={[Counter]} props={{ id: 0 }}>
        <ServiceProvider provide={[Counter2]} props={{ id: 0 }}>
          <CounterView />
          <CounterView />
        </ServiceProvider>
      </ServiceProvider> */}
    </div>
  )
}

@injectable()
class DragService {
  public readonly ref = createRef<HTMLDivElement>()

  constructor() {
    console.log('DragService created')
  }

  @onMount
  mounted() {
    console.log(this.ref.current?.innerText, 'mounted')
  }
}

@injectable()
class CounterViewModel {
  public counter: any

  constructor(@inject(Container) private container: Container) {
    this.counter = this.container.resolve(CounterService, { a: 1 })
  }
}

const CounterView = component(() => {
  // const vm = useService(Counter2)
  const vm2 = useViewModel(CounterViewModel)
  // const vm3 = useViewModel(Counter)

  return (
    <div>
      {/* <button onClick={() => vm.count++}>{vm.count}</button> */}
      <button onClick={() => vm2.counter.count++}>{vm2.counter.count}</button>
      {/* <button onClick={() => vm3.count++}>{vm3.count}</button> */}
    </div>
  )
})

export const DragComp = component(() => {
  const dragService = useService(DragService)
  const dragService2 = useResolve(DragService)

  return (
    <div>
      <div ref={dragService.ref}>11</div>
      <div ref={dragService2.ref}>22</div>
    </div>
  )
})

export const Drag = component(() => {
  return (
    <ServiceProvider provide={[[DragService, 'transient']]}>
      <DragComp />
    </ServiceProvider>
  )
})

container.registerSingleton(DragService)
const c1 = container.createChildContainer()
console.log(c1.isRegistered(DragService))
