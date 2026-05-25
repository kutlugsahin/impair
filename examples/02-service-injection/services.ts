import { inject, injectable, state } from 'impair'

@injectable()
export class TodoApi {
  async load(): Promise<string[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, 400)
    })
    return ['Buy milk', 'Walk the dog', 'Write more impair examples']
  }
}

@injectable()
export class TodoService {
  @state
  todos: string[] = []

  @state
  isLoading = false

  constructor(@inject(TodoApi) private api: TodoApi) {}

  async load() {
    this.isLoading = true
    this.todos = await this.api.load()
    this.isLoading = false
  }

  add(todo: string) {
    this.todos.push(todo)
  }

  clear() {
    this.todos = []
  }
}
