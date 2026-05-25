import { injectable, state } from 'impair'

@injectable()
export class ThemeService {
  @state
  color: 'light' | 'dark' = 'light'

  toggle() {
    this.color = this.color === 'light' ? 'dark' : 'light'
  }
}
