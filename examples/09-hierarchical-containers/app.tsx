import { component, ServiceProvider, useService } from 'impair'

import { NotificationService } from './notification-service'
import { ThemeService } from './theme-service'

const ThemeBar = component(function ThemeBar() {
  const { color, toggle } = useService(ThemeService)
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={toggle}>Toggle theme (currently: {color})</button>
    </div>
  )
})

const NotificationsPanel = component(function NotificationsPanel({ label }: { label: string }) {
  const { id, items, push, clear } = useService(NotificationService)
  return (
    <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
      <h4 style={{ marginTop: 0 }}>
        {label} (service #{id})
      </h4>
      <button onClick={() => push(`hello from ${label}`)}>Push</button>{' '}
      <button onClick={clear} disabled={items.length === 0}>
        Clear
      </button>
      <ul>
        {items.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  )
})

export function HierarchicalApp() {
  return (
    <ServiceProvider provide={[ThemeService]}>
      <ThemeBar />
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Each panel registers its own `NotificationService` but they share the outer `ThemeService`. Push a message —
        the prefix reflects the current theme; toggling theme is visible in both panels.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <ServiceProvider provide={[NotificationService]}>
          <NotificationsPanel label="Left" />
        </ServiceProvider>
        <ServiceProvider provide={[NotificationService]}>
          <NotificationsPanel label="Right" />
        </ServiceProvider>
      </div>
    </ServiceProvider>
  )
}
