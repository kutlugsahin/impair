import { useEffect, useState } from 'react'
import { StateEditor } from './StateEditor'
import type { Bridge } from '../hooks/useBridge'

type Props = {
  bridge: Bridge
  containerId: string
  tokenName: string
}

type InstanceState = {
  state: Record<string, any>
  derived: Record<string, any>
}

function evalGetInstanceState(containerId: string, tokenName: string): Promise<InstanceState | null> {
  return new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      `JSON.stringify(window.__IMPAIR_DEVTOOLS_HOOK__?.getInstanceState(${JSON.stringify(containerId)}, ${JSON.stringify(tokenName)}))`,
      (result: string, error: any) => {
        if (error) {
          resolve(null)
        } else {
          try {
            resolve(JSON.parse(result as string))
          } catch {
            resolve(null)
          }
        }
      },
    )
  })
}

export function ServiceDetail({ bridge, containerId, tokenName }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [instanceState, setInstanceState] = useState<InstanceState | null>(null)

  useEffect(() => {
    if (!expanded) return

    evalGetInstanceState(containerId, tokenName).then(setInstanceState)

    const unsub = bridge.subscribe((msg) => {
      if (msg.event === 'state-changed') {
        evalGetInstanceState(containerId, tokenName).then(setInstanceState)
      }
    })

    return unsub
  }, [bridge, containerId, tokenName, expanded])

  const stateEntries = instanceState ? Object.entries(instanceState.state) : []
  const derivedEntries = instanceState ? Object.entries(instanceState.derived) : []

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          background: '#313244',
          borderRadius: 3,
          fontWeight: 500,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 10, color: '#6c7086' }}>{expanded ? '\u25BC' : '\u25B6'}</span>
        <span style={{ color: '#cba6f7' }}>{tokenName}</span>
      </div>
      {expanded && instanceState && (
        <div style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
          {stateEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: '#6c7086', fontWeight: 600, marginBottom: 2 }}>
                @state
              </div>
              {stateEntries.map(([key, value]) => (
                <StateEditor
                  key={key}
                  propertyKey={key}
                  value={value}
                  onSave={(newValue) => {
                    bridge.send('setStateValue', {
                      containerId,
                      tokenName,
                      key,
                      value: newValue,
                    })
                  }}
                />
              ))}
            </div>
          )}
          {derivedEntries.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, color: '#6c7086', fontWeight: 600, marginBottom: 2 }}>
                @derived
              </div>
              {derivedEntries.map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    padding: '2px 0',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: '#a6e3a1', fontWeight: 500 }}>{key}:</span>
                  <span style={{ color: '#bac2de' }}>{formatValue(value)}</span>
                </div>
              ))}
            </div>
          )}
          {stateEntries.length === 0 && derivedEntries.length === 0 && (
            <div style={{ color: '#585b70', fontSize: 11 }}>No reactive properties</div>
          )}
        </div>
      )}
    </div>
  )
}

function formatValue(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 0)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}
