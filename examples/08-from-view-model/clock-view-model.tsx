import { type ReactElement } from 'react'

import { type Cleanup, component, injectable, onMount, type RendererViewModel, state } from 'impair'

@injectable()
class ClockViewModel implements RendererViewModel {
  @state
  now = new Date()

  @state
  paused = false

  @onMount
  start(cleanup: Cleanup) {
    const handle = setInterval(() => {
      if (!this.paused) this.now = new Date()
    }, 1000)
    cleanup(() => clearInterval(handle))
  }

  togglePause() {
    this.paused = !this.paused
  }

  render(): ReactElement {
    return (
      <div>
        <div style={{ fontSize: 32, fontFamily: 'monospace' }}>{this.now.toLocaleTimeString()}</div>
        <button onClick={this.togglePause}>{this.paused ? 'Resume' : 'Pause'}</button>
      </div>
    )
  }
}

export const Clock = component.fromViewModel(ClockViewModel)
