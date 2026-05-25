import { component, ServiceProvider, useService } from 'impair'

import { InvoiceService, OrderService } from './services'

const Logs = component(function Logs() {
  const { log: orderLog, placeOrder } = useService(OrderService)
  const { log: invoiceLog, refund } = useService(InvoiceService)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => placeOrder('mug')}>Place order (mug)</button>{' '}
        <button onClick={() => refund('mug')}>Refund (mug)</button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <pre style={pane}>{['OrderService.log', ...orderLog].join('\n')}</pre>
        <pre style={pane}>{['InvoiceService.log', ...invoiceLog].join('\n')}</pre>
      </div>
    </div>
  )
})

export function CircularDemo() {
  return (
    <ServiceProvider provide={[OrderService, InvoiceService]}>
      <Logs />
    </ServiceProvider>
  )
}

const pane = {
  flex: 1,
  background: '#1e1e1e',
  color: '#e8e8e8',
  padding: 12,
  borderRadius: 6,
  margin: 0,
  minHeight: 120,
  whiteSpace: 'pre-wrap' as const,
}
