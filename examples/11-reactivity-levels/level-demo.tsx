import { useRef } from 'react'

import { component, useViewModel } from 'impair'

import { LevelViewModel } from './level-view-model'

const Row = component(function Row({ label, value }: { label: string; value: number }) {
  const renders = useRef(0)
  renders.current++
  return (
    <tr>
      <td style={{ padding: 4 }}>{label}</td>
      <td style={{ padding: 4, fontFamily: 'monospace' }}>{value}</td>
      <td style={{ padding: 4, fontFamily: 'monospace', opacity: 0.7 }}>renders: {renders.current}</td>
    </tr>
  )
})

export const LevelDemo = component(function LevelDemo() {
  const { deep, shallow, atom, bumpNested, replaceWhole } = useViewModel(LevelViewModel)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={bumpNested}>bump nested .count</button>{' '}
        <button onClick={replaceWhole}>replace whole object</button>
      </div>

      <table>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: 4 }}>level</th>
            <th style={{ textAlign: 'left', padding: 4 }}>.count seen by view</th>
            <th style={{ textAlign: 'left', padding: 4 }}>row re-renders</th>
          </tr>
        </thead>
        <tbody>
          <Row label="@state.deep" value={deep.count} />
          <Row label="@state.shallow" value={shallow.count} />
          <Row label="@state.atom" value={atom.count} />
        </tbody>
      </table>

      <p style={{ opacity: 0.7, fontSize: 13, marginTop: 16 }}>
        Notice: <code>@state.atom</code> only re-renders on "replace whole object", because nested mutations are
        invisible to it. <code>@state.deep</code> picks up both. <code>@state.shallow</code> also misses nested
        mutations — first-level property assignment would be observed, but here we mutate <em>through</em> the existing
        nested object.
      </p>
    </div>
  )
})
