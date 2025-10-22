import { componentWithServices, inject, injectable, state, useService } from 'impair'

@injectable.global()
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

// @provide([[Counter, 'transient']])
@injectable()
export class SelfService {
  constructor(@inject(Counter) public c1: Counter, @inject(Counter) public c2: Counter) {}
}

const component = componentWithServices([SelfService, 'transient'])

export const App = component(() => {
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
    </div>
  )
})
