import type { CSSProperties } from 'react'

import { component, useViewModel } from 'impair'

import { TimerViewModel } from './timer-view-model'

/**
 * `component(...)` + `useViewModel(...)` path.
 *
 * Scenario: let the timer tick to ~5, then edit `timer-view-model.ts`
 * (change `tickEveryMs` or the log text) and save.
 *
 * Expected with the HMR fix:
 *   - seconds keeps its value (does NOT reset to 0)
 *   - exactly one tick per second appears in the console
 *   - no `[TimerVM#N] start interval` flood per save
 */
export const TimerPanel = component(function TimerPanel() {
  const vm = useViewModel(TimerViewModel)

  return (
    <section style={card}>
      <h3 style={{ margin: 0 }}>
        component + useViewModel <small style={dim}>(instance #{vm.instanceId})</small>
      </h3>
      <p style={dim}>interval = {vm.tickEveryMs}ms — edit the VM file to trigger HMR</p>
      <div style={row}>
        <strong style={value}>{vm.seconds}s</strong>
        <button onClick={vm.reset}>reset</button>
      </div>
    </section>
  )
})

const card: CSSProperties = { border: '1px solid #44a', padding: 12, borderRadius: 6, marginBottom: 12 }
const row: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' }
const value: CSSProperties = { minWidth: 64, textAlign: 'center', fontSize: 18 }
const dim: CSSProperties = { opacity: 0.7, fontSize: 12, margin: '4px 0' }
