import { type Cleanup, injectable, state, trigger, untrack } from 'impair'

type Save = {
  at: string
  by: string
  preview: string
}

@injectable()
export class AutoSaveViewModel {
  @state
  draft = 'Type something — every change autosaves.'

  @state
  author = 'anonymous'

  @state
  saves: Save[] = []

  setDraft(next: string) {
    this.draft = next
  }

  setAuthor(next: string) {
    this.author = next
  }

  @trigger
  autoSave(cleanup: Cleanup) {
    // Tracked: this is the dependency we want to react to.
    const preview = this.draft.slice(0, 40)

    // Untracked: read the *current* value of `author` without subscribing.
    // Changing `author` alone won't re-run this trigger.
    const by = untrack(() => this.author)

    // (Imagine a network save here.) Pretend it's debounced + abortable.
    const aborted = { value: false }
    cleanup(() => {
      aborted.value = true
    })

    setTimeout(() => {
      if (aborted.value) return
      this.saves.unshift({
        at: new Date().toLocaleTimeString(),
        by,
        preview,
      })
    }, 300)
  }
}
