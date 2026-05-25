import { type Cleanup, inject, injectable, Props, state, trigger } from 'impair'

export type UserProps = {
  userId: number
}

type User = {
  id: number
  name: string
}

@injectable()
export class UserViewModel {
  @state
  user: User | null = null

  @state
  isLoading = false

  constructor(@inject(Props) public props: UserProps) {}

  @trigger
  async loadUser(cleanup: Cleanup) {
    const controller = new AbortController()
    cleanup(() => controller.abort())

    this.isLoading = true
    this.user = null

    const id = this.props.userId

    // Simulated fetch — replace with a real call in your project.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, 500)
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new DOMException('aborted', 'AbortError'))
      })
    }).catch(() => {})

    if (controller.signal.aborted) return

    this.user = { id, name: `User #${id}` }
    this.isLoading = false
  }
}
