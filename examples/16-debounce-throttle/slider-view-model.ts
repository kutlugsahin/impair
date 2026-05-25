import { injectable, state, trigger, untrack } from 'impair'

@injectable()
export class SliderViewModel {
  // The single source of truth that all four triggers depend on.
  @state
  value = 50

  // One run counter and one "last value seen" per scheduler variant.
  // Counters give the visible signal; snapshots show what each trigger observed last.
  @state
  syncRuns = 0
  @state
  syncSnapshot = 50

  @state
  asyncRuns = 0
  @state
  asyncSnapshot = 50

  @state
  debounceRuns = 0
  @state
  debounceSnapshot = 50

  @state
  throttleRuns = 0
  @state
  throttleSnapshot = 50

  setValue(next: number) {
    this.value = next
  }

  reset() {
    this.syncRuns = 0
    this.asyncRuns = 0
    this.debounceRuns = 0
    this.throttleRuns = 0
  }

  @trigger
  onSync() {
    this.syncSnapshot = this.value

    this.syncRuns++
  }

  @trigger.async
  onAsync() {
    this.asyncSnapshot = this.value

    this.asyncRuns++
  }

  @trigger.debounce(200)
  onDebounced() {
    this.debounceSnapshot = this.value

    this.debounceRuns++
  }

  @trigger.throttle(200)
  onThrottled() {
    this.throttleSnapshot = this.value

    this.throttleRuns++
  }
}
