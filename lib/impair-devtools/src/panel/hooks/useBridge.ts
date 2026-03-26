import { useEffect, useRef, useCallback, useState } from 'react'
import type { PanelCommand } from '../../shared/protocol'

type Listener = (message: any) => void

export type Bridge = {
  send: (command: PanelCommand, args?: any) => void
  subscribe: (callback: Listener) => () => void
  request: (command: PanelCommand, args?: any) => Promise<any>
}

let reqCounter = 0

export function useBridge(): Bridge {
  const portRef = useRef<chrome.runtime.Port | null>(null)
  const listenersRef = useRef(new Set<Listener>())
  const [, setReady] = useState(false)

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'impair-devtools-panel' })
    portRef.current = port

    // Send tabId so background knows which tab this panel belongs to
    port.postMessage({ tabId: chrome.devtools.inspectedWindow.tabId })

    port.onMessage.addListener((message) => {
      listenersRef.current.forEach((cb) => cb(message))
    })

    port.onDisconnect.addListener(() => {
      portRef.current = null
    })

    setReady(true)

    return () => {
      port.disconnect()
    }
  }, [])

  const send = useCallback((command: PanelCommand, args?: any, requestId?: string) => {
    portRef.current?.postMessage({ command, args, requestId })
  }, [])

  const subscribe = useCallback((callback: Listener) => {
    listenersRef.current.add(callback)
    return () => listenersRef.current.delete(callback)
  }, [])

  const request = useCallback(
    (command: PanelCommand, args?: any): Promise<any> => {
      const requestId = `req-${++reqCounter}`
      return new Promise((resolve) => {
        const handler = (message: any) => {
          if (message.event === 'response' && message.requestId === requestId) {
            listenersRef.current.delete(handler)
            resolve(message.result)
          }
        }
        listenersRef.current.add(handler)
        send(command, args, requestId)
      })
    },
    [send],
  )

  return { send, subscribe, request }
}
