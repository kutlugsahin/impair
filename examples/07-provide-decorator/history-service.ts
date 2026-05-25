import { injectable, state } from 'impair'

let seq = 0

@injectable()
export class HistoryService {
  readonly id = ++seq

  @state
  past: string[] = []

  @state
  future: string[] = []

  push(value: string) {
    this.past.push(value)
    this.future = []
  }

  undo(current: string): string | undefined {
    const previous = this.past.pop()
    if (previous === undefined) return undefined
    this.future.push(current)
    return previous
  }

  redo(current: string): string | undefined {
    const next = this.future.pop()
    if (next === undefined) return undefined
    this.past.push(current)
    return next
  }
}
