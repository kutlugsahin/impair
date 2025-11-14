import { state, trigger, injectable, inject, onMount } from 'impair'

import { AuthService } from './auth-service'

@injectable()
export class UserService {
  @state
  user: any = undefined

  @state
  isLoading = false

  constructor(@inject(AuthService) private authService: AuthService) {
    console.log('UserService created')
  }

  @onMount
  async loadUser() {
    this.isLoading = true
    if (this.authService.isAuthenticated) {
      this.user = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ name: 'John Doe', id: 1 })
        }, 500)
      })
    }

    this.isLoading = false
  }
}
