import { injectable, onInit, state } from 'impair'

@injectable()
export class CounterService {
  constructor() {
    console.log('CounterService created')
  }

  @onInit
  init() {
    console.log('CounterService initialized')
  }

  @state
  count = 9

  increment() {
    this.count++
  }
}
