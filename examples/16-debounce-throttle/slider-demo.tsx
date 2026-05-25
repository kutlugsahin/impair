import type { CSSProperties } from 'react'

import { component, useViewModel } from 'impair'

import { SliderViewModel } from './slider-view-model'

export const SliderDemo = component(function SliderDemo() {
  const {
    value,
    setValue,
    reset,
    syncRuns,
    syncSnapshot,
    asyncRuns,
    asyncSnapshot,
    debounceRuns,
    debounceSnapshot,
    throttleRuns,
    throttleSnapshot,
  } = useViewModel(SliderViewModel)

  return (
    <div>
      <p style={{ opacity: 0.7, fontSize: 13, marginTop: 0 }}>
        Drag the slider continuously (mouse-down, sweep, release). Each pixel of movement mutates{' '}
        <code>value</code> — each variant reacts differently.
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <p style={{ fontFamily: 'monospace', fontSize: 14 }}>
        value = <strong>{value}</strong>
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={th}>variant</th>
            <th style={th}>runs</th>
            <th style={th}>last value seen</th>
          </tr>
        </thead>
        <tbody>
          <tr style={tr}>
            <td style={td}>
              <code>@trigger</code> (sync)
            </td>
            <td style={tdNum}>{syncRuns}</td>
            <td style={tdNum}>{syncSnapshot}</td>
          </tr>
          <tr style={tr}>
            <td style={td}>
              <code>@trigger.async</code>
            </td>
            <td style={tdNum}>{asyncRuns}</td>
            <td style={tdNum}>{asyncSnapshot}</td>
          </tr>
          <tr style={tr}>
            <td style={td}>
              <code>@trigger.debounce(200)</code>
            </td>
            <td style={tdNum}>{debounceRuns}</td>
            <td style={tdNum}>{debounceSnapshot}</td>
          </tr>
          <tr style={tr}>
            <td style={td}>
              <code>@trigger.throttle(200)</code>
            </td>
            <td style={tdNum}>{throttleRuns}</td>
            <td style={tdNum}>{throttleSnapshot}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Sweep the slider from one end to the other in one motion. Sync &amp; async pile up runs (one per
        pixel-event); debounce stays at its previous count until ~200ms after you release; throttle ticks at the start
        and roughly every 200ms during the drag.
      </p>

      <button type="button" onClick={reset}>
        reset counters
      </button>
    </div>
  )
})

const th: CSSProperties = { textAlign: 'left', padding: '6px 8px', fontSize: 13 }
const tr: CSSProperties = { borderBottom: '1px solid #f0f0f0' }
const td: CSSProperties = { padding: '6px 8px' }
const tdNum: CSSProperties = { padding: '6px 8px', fontFamily: 'monospace', textAlign: 'right' as const }
