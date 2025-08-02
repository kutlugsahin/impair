import { component, inject, injectable, Props, ServiceProvider, state, useService, useViewModel } from 'impair/index'

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

export function ResolveTest() {
  return (
    <div>
      <ServiceProvider provide={[Counter]} props={{ id: 5 }}>
        <ServiceProvider provide={[Counter2]} props={{ id: 1 }}>
          <CounterView />
          <CounterView />
        </ServiceProvider>
      </ServiceProvider>
      <hr />
      <ServiceProvider provide={[Counter]} props={{ id: 0 }}>
        <ServiceProvider provide={[Counter2]} props={{ id: 0 }}>
          <CounterView />
          <CounterView />
        </ServiceProvider>
      </ServiceProvider>
    </div>
  )
}

const CounterView = component(() => {
  const vm = useService(Counter2)
  const vm2 = useService(Counter)
  const vm3 = useViewModel(Counter)

  return (
    <div>
      <button onClick={() => vm.count++}>{vm.count}</button>
      <button onClick={() => vm2.count++}>{vm2.count}</button>
      <button onClick={() => vm3.count++}>{vm3.count}</button>
    </div>
  )
})
