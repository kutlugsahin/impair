import { Container, inject, injectable, provide, state } from 'impair'

export const EVENT_HANDLER = 'EventHandler'

export interface EventHandler {
  handle(eventName: string): void
}

@injectable()
export class EventBus {
  @state
  log: string[] = []

  constructor(@inject(Container) private container: Container) {}

  dispatch(eventName: string) {
    const handlers = this.container.resolveAll<EventHandler>(EVENT_HANDLER)
    for (const h of handlers) h.handle(eventName)
  }

  clear() {
    this.log = []
  }
}

@provide([EventBus])
@injectable()
export class LoggingHandler implements EventHandler {
  constructor(@inject(EventBus) private bus: EventBus) {}
  handle(eventName: string) {
    this.bus.log.push(`[Logging] ${eventName}`)
  }
}

@injectable()
export class AnalyticsHandler implements EventHandler {
  constructor(@inject(EventBus) private bus: EventBus) {}
  handle(eventName: string) {
    this.bus.log.push(`[Analytics] ${eventName}`)
  }
}
