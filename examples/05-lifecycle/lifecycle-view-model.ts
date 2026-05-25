import { type Cleanup, injectable, onDispose, onInit, onMount, onUnmount, state } from 'impair'

let seq = 0

@injectable()
export class LifecycleViewModel {
  readonly id = ++seq

  @state
  ticks = 0

  @onInit
  init(cleanup: Cleanup) {
    console.log(`[VM#${this.id}] @onInit`)
    cleanup(() => console.log(`[VM#${this.id}] @onInit cleanup (instance disposed)`))
  }

  @onMount
  mount(cleanup: Cleanup) {
    console.log(`[VM#${this.id}] @onMount`)
    const handle = setInterval(() => {
      this.ticks++
    }, 1000)
    cleanup(() => {
      console.log(`[VM#${this.id}] @onMount cleanup (component unmounted)`)
      clearInterval(handle)
    })
  }

  @onUnmount
  unmount() {
    console.log(`[VM#${this.id}] @onUnmount`)
  }

  @onDispose
  dispose() {
    console.log(`[VM#${this.id}] @onDispose`)
  }
}
