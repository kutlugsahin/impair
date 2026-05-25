import { inject, injectable, provide, state } from 'impair'

import { HistoryService } from './history-service'

@injectable()
@provide([HistoryService])
export class EditorViewModel {
  @state
  text = ''

  constructor(@inject(HistoryService) public history: HistoryService) {}

  setText(text: string) {
    this.history.push(this.text)
    this.text = text
  }

  undo() {
    const previous = this.history.undo(this.text)
    if (previous !== undefined) this.text = previous
  }

  redo() {
    const next = this.history.redo(this.text)
    if (next !== undefined) this.text = next
  }
}
