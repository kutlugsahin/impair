import { useEffect, useState } from 'react'
import { ServiceDetail } from './ServiceDetail'
import type { Bridge } from '../hooks/useBridge'

type Props = {
  bridge: Bridge
  containerId: string
}

type ContainerDetails = {
  id: string
  services: { tokenName: string }[]
}

function evalGetContainerDetails(id: string): Promise<ContainerDetails | null> {
  return new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      `JSON.stringify(window.__IMPAIR_DEVTOOLS_HOOK__?.getContainerDetails(${JSON.stringify(id)}))`,
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

export function ServiceList({ bridge, containerId }: Props) {
  const [details, setDetails] = useState<ContainerDetails | null>(null)

  useEffect(() => {
    evalGetContainerDetails(containerId).then(setDetails)

    const unsub = bridge.subscribe((msg) => {
      if (msg.event === 'instance-registered' && msg.data?.containerId === containerId) {
        evalGetContainerDetails(containerId).then(setDetails)
      }
    })

    return unsub
  }, [bridge, containerId])

  if (!details) {
    return <div style={{ color: '#585b70', padding: 8 }}>Loading...</div>
  }

  if (details.services.length === 0) {
    return <div style={{ color: '#585b70', padding: 8 }}>No resolved services</div>
  }

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#a6adc8', paddingBottom: 8 }}>
        Services — {containerId}
      </div>
      {details.services.map((svc) => (
        <ServiceDetail
          key={svc.tokenName}
          bridge={bridge}
          containerId={containerId}
          tokenName={svc.tokenName}
        />
      ))}
    </div>
  )
}
