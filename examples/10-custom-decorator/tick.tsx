import { component, useViewModel } from 'impair'

import { TickViewModel } from './tick-view-model'

export const Tick = component(function Tick() {
  const { fast, slow } = useViewModel(TickViewModel)
  return (
    <div style={{ display: 'flex', gap: 24, fontFamily: 'monospace', fontSize: 24 }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>@interval(500)</div>
        {fast}
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>@interval(1000)</div>
        {slow}
      </div>
    </div>
  )
})
