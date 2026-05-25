import { injectable, state } from 'impair'

type Nested = { count: number }

@injectable()
export class LevelViewModel {
  @state.deep
  deep: Nested = { count: 0 }

  @state.shallow
  shallow: Nested = { count: 0 }

  @state.atom
  atom: Nested = { count: 0 }

  // Bumping the nested `count` on each object.
  bumpNested() {
    this.deep.count++
    this.shallow.count++
    this.atom.count++
  }

  // Replacing each whole object with a new reference.
  replaceWhole() {
    this.deep = { count: this.deep.count + 1 }
    this.shallow = { count: this.shallow.count + 1 }
    this.atom = { count: this.atom.count + 1 }
  }
}
