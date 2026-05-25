import { component, injectable, state, useViewModel } from 'impair'

@injectable()
class CounterViewModel {
  @state
  count = 0

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }
}

export const Counter = component(function Counter() {
  // Destructuring the VM is safe — every field/method goes through a getter on the
  // (read-only) view proxy, and reactive reads are tracked at the moment of access
  // during render. The destructured `count` is the current value; `increment` is the
  // auto-bound method.
  const { count, increment, decrement } = useViewModel(CounterViewModel)

  return (
    <div>
      <button onClick={decrement}>-</button>
      <strong style={{ margin: '0 12px' }}>{count}</strong>
      <button onClick={increment}>+</button>
    </div>
  )
})
