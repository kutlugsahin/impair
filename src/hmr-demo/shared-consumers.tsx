import type { CSSProperties } from 'react'

import { component, useService } from 'impair'

import { SharedService } from './shared-service'

export const SharedConsumerA = component(function SharedConsumerA() {
  const svc = useService(SharedService)
  return (
    <div style={half}>
      <p style={dim}>Consumer A (instance #{svc.instanceId})</p>
      <button onClick={svc.bump}>A: bump ({svc.value})</button>
    </div>
  )
})

export const SharedConsumerB = component(function SharedConsumerB() {
  const svc = useService(SharedService)
  return (
    <div style={half}>
      <p style={dim}>Consumer B (instance #{svc.instanceId})</p>
      <button onClick={svc.bump}>B: bump ({svc.value})</button>
    </div>
  )
})

const half: CSSProperties = { flex: 1, border: '1px dashed #888', padding: 8, borderRadius: 6 }
const dim: CSSProperties = { opacity: 0.7, fontSize: 12, margin: '4px 0' }
