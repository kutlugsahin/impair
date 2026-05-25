import { injectable, onMount, state, trigger, type Cleanup } from 'impair'

let instanceSeq = 0

/**
 * A service registered once at the parent ServiceProvider and consumed by two
 * sibling components. Mutations from either consumer must be visible to the other.
 *
 * EDIT THIS FILE to trigger HMR.
 *
 * Symptoms WITHOUT the fix:
 *   - Each save bumps the instance counter — two siblings end up looking at
 *     different SharedService instances (clicking one button doesn't update the other).
 *   - The @trigger fires once per click + once per leftover ghost instance.
 *
 * With the fix:
 *   - Both siblings share the same instance after HMR.
 *   - Trigger logs once per click (not N times).
 */
@injectable()
export class SharedService {
  readonly instanceId = ++instanceSeq

  @state
  value = 1

  @onMount
  onMount(cleanup: Cleanup) {
    console.log(`[SharedService#${this.instanceId}] onMount`)
    cleanup(() => console.log(`[SharedService#${this.instanceId}] onUnmount`))
  }

  @trigger
  logValue() {
    console.log(`[SharedService#${this.instanceId}] trigger value=${this.value}`)
  }

  bump = () => {
    this.value++
  }
}
