import { component, derived, injectable, ServiceProvider, state, trigger, useService } from 'impair'

@injectable()
export class Service {
  @state
  data = [
    {
      a: 1,
      b: {
        d: 1,
        c: 2,
      },
    },
  ]

  @trigger
  log() {
    console.log('asdas', this.computedData)
  }

  @derived
  get computedData() {
    return this.data[0].b.c
  }

  inc() {
    this.data[0].b = {
      c: 2,
      d: this.data[0].b.d + 1,
    }
  }
}

@injectable()
class CounterService {
  @state
  count = 0

  inc() {
    this.count++
  }
}

const CounterComponent = component(() => {
  const { count, inc } = useService(CounterService)

  return (
    <div>
      <button onClick={inc}>{count}</button>
    </div>
  )
})

const CounterComponent2 = component(() => {
  const { count, inc } = useService<CounterService>('counter')

  return (
    <div>
      <button onClick={inc}>{count}</button>
    </div>
  )
})

const CounterComponent3 = component(() => {
  const { count, inc } = useService<CounterService>('counterService')

  return (
    <div>
      <button onClick={inc}>{count}</button>
    </div>
  )
})

export const App = () => {
  return (
    <ServiceProvider
      provide={[
        {
          token: CounterService,
          provider: {
            useToken: 'counterService',
          },
        },
        {
          token: 'counterService',
          provider: {
            useClass: CounterService,
          },
          lifecycle: 'singleton',
        },
        {
          token: 'counter',
          provider: {
            useToken: CounterService,
          },
        },
      ]}
    >
      <CounterComponent />
      <CounterComponent2 />
      <CounterComponent3 />
    </ServiceProvider>
  )
}
