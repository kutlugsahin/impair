import { useState, useEffect, useCallback } from 'react'
import type { Bridge } from './useBridge'

export type TreeNode = {
  id: string
  parentId: string | null
  services: string[]
  children: TreeNode[]
}

function buildTree(flatNodes: { id: string; parentId: string | null; services: string[] }[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  flatNodes.forEach((node) => {
    nodeMap.set(node.id, { ...node, children: [] })
  })

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function evalGetTree(): Promise<any[] | null> {
  return new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      'JSON.stringify(window.__IMPAIR_DEVTOOLS_HOOK__?.getTree() || [])',
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

export function useProviderTree(bridge: Bridge): TreeNode[] {
  const [tree, setTree] = useState<TreeNode[]>([])

  const refresh = useCallback(() => {
    // Use inspectedWindow.eval for direct access — works even if
    // the extension was loaded after the page (no relay dependency)
    evalGetTree().then((nodes) => {
      if (nodes) {
        setTree(buildTree(nodes))
      }
    })
  }, [])

  useEffect(() => {
    // Initial fetch
    refresh()

    const unsub = bridge.subscribe((message) => {
      if (
        message.event === 'container-registered' ||
        message.event === 'container-unregistered' ||
        message.event === 'instance-registered'
      ) {
        refresh()
      }
    })

    return unsub
  }, [bridge, refresh])

  return tree
}
