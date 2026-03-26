import { useState } from 'react'
import { ProviderTree } from './components/ProviderTree'
import { ServiceList } from './components/ServiceList'
import { useBridge } from './hooks/useBridge'
import { useProviderTree, TreeNode } from './hooks/useProviderTree'

export function App() {
  const bridge = useBridge()
  const tree = useProviderTree(bridge)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: '30%',
          height: '100vh',
          borderRight: '1px solid #313244',
          overflowY: 'auto',
          padding: '8px',
          background: '#181825',
        }}
      >
        <div style={{ padding: '4px 0 8px', fontWeight: 600, fontSize: 13, color: '#a6adc8' }}>
          Providers
        </div>
        <ProviderTree nodes={tree} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div style={{ width: '70%', height: '100vh', overflowY: 'auto', padding: '8px' }}>
        {selectedId ? (
          <ServiceList bridge={bridge} containerId={selectedId} />
        ) : (
          <div style={{ color: '#585b70', padding: 16 }}>Select a provider to inspect</div>
        )}
      </div>
    </div>
  )
}
