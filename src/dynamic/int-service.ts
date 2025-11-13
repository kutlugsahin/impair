import { injectable, onInit, state } from 'impair'

@injectable()
export class IntService {
  @state
  isLoaded = false

  @onInit
  init() {
    setTimeout(() => {
      this.isLoaded = true
    }, 500)
  }
}
