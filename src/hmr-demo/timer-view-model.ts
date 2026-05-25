import { injectable, onMount, state, trigger, type Cleanup } from 'impair'

let instanceSeq = 0

/**
 * A second VM consumed via `useViewModel` from a `component()`-wrapped function.
 * Demonstrates the same HMR scenario for the non-fromViewModel path.
 */
@injectable()
export class TimerViewModel {
  readonly instanceId = ++instanceSeq

  @state
  seconds = 0

  // EDIT THIS NUMBER to trigger HMR. With the fix:
  //   - seconds keeps ticking from where it was
  //   - the interval doesn't pile up (you should see exactly 1 tick/sec)
  //   - only one [TimerVM#N] instance survives, not a queue of N
  readonly tickEveryMs = 1000

  @onMount
  start(cleanup: Cleanup) {
    console.log(`[TimerVM#${this.instanceId}] start interval (${this.tickEveryMs}ms)`)
    const handle = setInterval(() => {
      this.seconds++
    }, this.tickEveryMs)

    cleanup(() => {
      console.log(`[TimerVM#${this.instanceId}] stop interval`)
      clearInterval(handle)
    })
  }

  @trigger
  logSeconds() {
    if (this.seconds === 0) return
    console.log(`[TimerVM#${this.instanceId}] tick = ${this.seconds}`)
  }

  reset = () => {
    this.seconds = 0
  }
}
