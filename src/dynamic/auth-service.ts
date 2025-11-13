import { injectable, onInit, onMount, state } from 'impair'

@injectable()
export class AuthService {
  @state
  isAuthenticated = false

  constructor() {}

  @onMount
  login() {
    setTimeout(() => {
      this.isAuthenticated = true
    }, 1000)
  }
}
