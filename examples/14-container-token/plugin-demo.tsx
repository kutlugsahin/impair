import { component, ServiceProvider, useService } from 'impair'

import { AnalyticsHandler, EVENT_HANDLER, EventBus, LoggingHandler } from './services'

const BusView = component(function BusView() {
  const { log, dispatch, clear } = useService(EventBus)
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => dispatch('user.signedIn')}>Dispatch user.signedIn</button>{' '}
        <button onClick={() => dispatch('cart.checkout')}>Dispatch cart.checkout</button>{' '}
        <button onClick={clear} disabled={log.length === 0}>
          Clear
        </button>
      </div>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#e8e8e8',
          padding: 12,
          borderRadius: 6,
          minHeight: 120,
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {log.join('\n')}
      </pre>
    </div>
  )
})

export function PluginDemo() {
  return (
    <ServiceProvider
      provide={[
        EventBus,
        [EVENT_HANDLER, LoggingHandler],
        [EVENT_HANDLER, AnalyticsHandler],
      ]}
    >
      <BusView />
    </ServiceProvider>
  )
}
