import { useState } from 'react'
import type { TreeNode } from '../hooks/useProviderTree'

type Props = {
  node: TreeNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TreeNodeComponent({ node, depth, selectedId, onSelect }: Props) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = node.id === selectedId

  const label =
    node.services.length > 0
      ? node.services.filter((s) => s !== 'Container' && s !== 'Props').join(', ') || node.id
      : node.id

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        style={{
          paddingLeft: depth * 16 + 4,
          paddingTop: 3,
          paddingBottom: 3,
          cursor: 'pointer',
          background: isSelected ? '#313244' : 'transparent',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
        }}
      >
        {hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            style={{
              display: 'inline-block',
              width: 12,
              textAlign: 'center',
              color: '#6c7086',
              fontSize: 10,
              userSelect: 'none',
            }}
          >
            {expanded ? '\u25BC' : '\u25B6'}
          </span>
        )}
        {!hasChildren && <span style={{ display: 'inline-block', width: 12 }} />}
        <span style={{ color: '#89b4fa', fontWeight: isSelected ? 600 : 400 }}>{label}</span>
        <span style={{ color: '#585b70', fontSize: 10, marginLeft: 4 }}>
          ({node.services.length})
        </span>
      </div>
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNodeComponent
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  )
}
