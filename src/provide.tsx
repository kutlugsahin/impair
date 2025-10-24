import { componentWithServices, inject, injectable, provide, state, useResolve, useService } from 'impair'
import React from 'react'

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

@injectable()
@provide([[Counter, 'transient']])
export class SelfService {
  constructor(@inject(Counter) public c1: Counter, @inject(Counter) public c2: Counter) {}
}

const component = componentWithServices()

export const App = component(() => {
  const s1 = useResolve(SelfService)
  const s2 = useResolve(SelfService)

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
