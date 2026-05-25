import { inject, injectable, state } from 'impair'

import { ThemeService } from './theme-service'

let seq = 0

@injectable()
export class NotificationService {
  readonly id = ++seq

  @state
  items: string[] = []

  constructor(@inject(ThemeService) public theme: ThemeService) {}

  push(message: string) {
    this.items.push(`[${this.theme.color}] ${message}`)
  }

  clear() {
    this.items = []
  }
}
