import type { CSSProperties } from 'react'

import { component, ServiceProvider } from 'impair'

import { CounterViewModel } from './counter-view-model'
import { SharedConsumerA, SharedConsumerB } from './shared-consumers'
import { SharedService } from './shared-service'
import { TimerPanel } from './timer-panel'

/**
 * HMR demo for impair.
 *
 * THREE scenarios to exercise after `npm run dev`:
 *
 *   1. component.fromViewModel — increment the green counter to something > 0,
 *      then edit `counter-view-model.tsx` (e.g. change the `banner` string).
 *      With the fix, the number stays put on save. Without, it resets to 0.
 *
 *   2. component + useViewModel — let the blue timer tick to ~5s, then edit
 *      `timer-view-model.ts`. With the fix, the seconds keep counting from where
 *      they were and the interval doesn't pile up.
 *
 *   3. ServiceProvider + useService — bump A or B a few times, then edit
 *      `shared-service.ts`. With the fix, both numbers stay in sync after save
 *      and the `[SharedService#N] trigger` line appears once per click (not N
 *      times).
 *
 * Watch the browser devtools console for the lifecycle logs from each VM/service.
 */
export const HmrDemo = component(function HmrDemo() {
  return (
    <main style={shell}>
      <h1 style={{ marginTop: 0 }}>Impair HMR demo</h1>
      <p style={{ opacity: 0.7 }}>
        Edit one of the VM/service files in <code>src/hmr-demo</code> and save. State should
        survive, side effects should not duplicate.
      </p>

      <CounterFromVM />

      <TimerPanel />

      <ServiceProvider provide={[SharedService]}>
        <section style={card}>
          <h3 style={{ margin: 0 }}>ServiceProvider + useService</h3>
          <p style={{ opacity: 0.7, fontSize: 12, margin: '4px 0' }}>
            both consumers should see the same `instance #N` and same value
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <SharedConsumerA />
            <SharedConsumerB />
          </div>
        </section>
      </ServiceProvider>
    </main>
  )
})

const CounterFromVM = component.fromViewModel(CounterViewModel)

const shell: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  maxWidth: 640,
  margin: '32px auto',
  padding: 16,
}

const card: CSSProperties = {
  border: '1px solid #a44',
  padding: 12,
  borderRadius: 6,
  marginBottom: 12,
}
