import { TreeNodeComponent } from './TreeNode'
import type { TreeNode } from '../hooks/useProviderTree'

type Props = {
  nodes: TreeNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ProviderTree({ nodes, selectedId, onSelect }: Props) {
  if (nodes.length === 0) {
    return <div style={{ color: '#585b70', padding: 8 }}>No providers detected</div>
  }

  // Skip root nodes — render their children directly
  const children = nodes.flatMap((node) => node.children)

  if (children.length === 0) {
    return <div style={{ color: '#585b70', padding: 8 }}>No providers detected</div>
  }

  return (
    <div>
      {children.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
