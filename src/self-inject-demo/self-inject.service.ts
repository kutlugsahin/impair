import { inject, injectable, state } from 'impair'

@injectable()
export class XService {}

@injectable()
export class ParentService {
  @state
  count = 0

  @state
  name = 'Parent'

  constructor(@inject(XService) private x: XService) {
    console.log('ParentService created')
  }

  increment() {
    this.count++
  }
}

@injectable()
export class ChildService {
  constructor(@inject(ParentService) private parent: ParentService) {
    console.log('ChildService created, parent:', this.parent)
  }

  @state
  localCount = 0

  get parentCount() {
    return this.parent.count
  }

  get parentName() {
    return this.parent.name
  }

  incrementLocal() {
    this.localCount++
  }

  incrementParent() {
    this.parent.increment()
  }
}
