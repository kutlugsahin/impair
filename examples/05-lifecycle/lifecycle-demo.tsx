import { useState } from 'react'

import { component, useViewModel } from 'impair'

import { LifecycleViewModel } from './lifecycle-view-model'

const TickerCard = component(function TickerCard() {
  const { id, ticks } = useViewModel(LifecycleViewModel)

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
      VM #{id} — ticks: <strong>{ticks}</strong>
    </div>
  )
})

export function LifecycleDemo() {
  const [visible, setVisible] = useState(true)

  return (
    <div>
      <p style={{ opacity: 0.7 }}>Open the browser console to watch the lifecycle log.</p>
      <button onClick={() => setVisible((v) => !v)} style={{ marginBottom: 12 }}>
        {visible ? 'Unmount' : 'Mount'}
      </button>
      {visible && <TickerCard />}
    </div>
  )
}
