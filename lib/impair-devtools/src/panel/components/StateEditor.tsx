import { useState, useRef, useEffect } from 'react'

type Props = {
  propertyKey: string
  value: any
  onSave: (value: any) => void
}

function isPrimitive(value: any): boolean {
  return value === null || value === undefined || typeof value !== 'object'
}

function parseInputValue(raw: string, originalValue: any): any {
  const trimmed = raw.trim()

  // Try to preserve original type
  if (typeof originalValue === 'number') {
    const num = Number(trimmed)
    if (!isNaN(num)) return num
  }

  if (typeof originalValue === 'boolean') {
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
  }

  if (trimmed === 'null') return null
  if (trimmed === 'undefined') return undefined

  // Try JSON parse for objects/arrays
  try {
    return JSON.parse(trimmed)
  } catch {
    // Return as string
    return raw
  }
}

function formatForEdit(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function formatDisplay(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

export function StateEditor({ propertyKey, value, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const startEdit = () => {
    setEditValue(formatForEdit(value))
    setEditing(true)
  }

  const save = () => {
    const parsed = parseInputValue(editValue, value)
    onSave(parsed)
    setEditing(false)
  }

  const cancel = () => {
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') {
      cancel()
    }
  }

  const inputStyle = {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    padding: '2px 4px',
    border: '1px solid #585b70',
    borderRadius: 2,
    background: '#313244',
    color: '#cdd6f4',
    outline: 'none',
  }

  if (editing) {
    const isObj = !isPrimitive(value)

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, padding: '2px 0' }}>
        <span style={{ color: '#89b4fa', fontWeight: 500, fontSize: 12, minWidth: 60 }}>
          {propertyKey}:
        </span>
        {isObj ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            style={inputStyle}
          />
        )}
      </div>
    )
  }

  return (
    <div
      onDoubleClick={startEdit}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        padding: '2px 0',
        fontSize: 12,
        cursor: 'pointer',
      }}
      title="Double-click to edit"
    >
      <span style={{ color: '#89b4fa', fontWeight: 500 }}>{propertyKey}:</span>
      <span style={{ color: '#fab387', fontFamily: 'monospace' }}>{formatDisplay(value)}</span>
    </div>
  )
}
