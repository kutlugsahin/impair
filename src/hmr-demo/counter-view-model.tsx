import { type CSSProperties, type ReactElement } from 'react'

import { injectable, onMount, state, trigger, type Cleanup, type RendererViewModel } from 'impair'

let instanceSeq = 0

@injectable()
export class CounterViewModel implements RendererViewModel {
  readonly instanceId = ++instanceSeq

  @state
  count = 10

  // EDIT THIS TEXT TO TRIGGER AN HMR UPDATE.
  // With the fix, `count` should keep its value and you should NOT see a flood of
  // construction / mount / cleanup logs in the console on every save.
  banner = 'edit this banner string to trigger HMR'

  @onMount
  onMount(cleanup: Cleanup) {
    console.log(`[CounterVM#${this.instanceId}] onMount  (count=${this.count})`)
    cleanup(() => {
      console.log(`[CounterVM#${this.instanceId}] onUnmount (count=${this.count})`)
    })
  }

  @trigger
  logCount(cleanup: Cleanup) {
    console.log(`[CounterVM#${this.instanceId}] trigger  (count=${this.count})`)
    cleanup(() => {
      console.log(`[CounterVM#${this.instanceId}] trigger cleanup`)
    })
  }

  increment = () => {
    this.count++
  }

  decrement = () => {
    this.count--
  }

  render(): ReactElement {
    return (
      <section style={card}>
        <h3 style={{ margin: 0 }}>
          component.fromViewModel <small style={dim}>(instance #{this.instanceId})</small>
        </h3>
        <p style={dim}>{this.banner}</p>
        <div style={row}>
          <button onClick={this.decrement}>-</button>
          <strong style={value}>{this.count}</strong>
          <button onClick={this.increment}>+</button>
        </div>
      </section>
    )
  }
}

const card: CSSProperties = { border: '1px solid #4a4', padding: 12, borderRadius: 6, marginBottom: 12 }
const row: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' }
const value: CSSProperties = { minWidth: 32, textAlign: 'center' }
const dim: CSSProperties = { opacity: 0.7, fontSize: 12, margin: '4px 0' }
