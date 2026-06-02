import type { CSSProperties } from 'react'

import { component, ServiceProvider, useService } from 'impair'

import { ChildService, ParentService } from './self-inject.service'

const ParentConsumer = component(function ParentConsumer() {
  const { count, increment, name } = useService(ParentService)

  return (
    <div>
      <strong>{name}</strong>
      <p>Parent count: {count}</p>
      <button onClick={increment}>Increment parent</button>
    </div>
  )
})

const ChildConsumer = component(function ChildConsumer() {
  const { localCount, parentCount, parentName, incrementLocal, incrementParent } = useService(ChildService)

  return (
    <div style={childCard}>
      <strong>Child (injected parent: {parentName})</strong>
      <p>Local count: {localCount}</p>
      <p>Parent count (from injected ref): {parentCount}</p>
      <button onClick={incrementLocal}>Increment local</button>
      <button onClick={incrementParent}>Increment parent (via child)</button>
    </div>
  )
})

export const SelfInjectDemo = component(function SelfInjectDemo() {
  return (
    <main style={shell}>
      <h1 style={{ marginTop: 0 }}>Parent Inject Demo</h1>
      <p style={{ opacity: 0.7 }}>ChildService injects ParentService from the outer ServiceProvider.</p>

      <ServiceProvider provide={[ParentService]}>
        <section style={card}>
          <ParentConsumer />

          <ServiceProvider provide={[ChildService]}>
            <ChildConsumer />
          </ServiceProvider>
        </section>
      </ServiceProvider>
    </main>
  )
})

const shell: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  maxWidth: 640,
  margin: '32px auto',
  padding: 16,
}

const card: CSSProperties = {
  border: '1px solid #4a4',
  padding: 12,
  borderRadius: 6,
  marginBottom: 12,
}

const childCard: CSSProperties = {
  border: '1px solid #44a',
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
}
