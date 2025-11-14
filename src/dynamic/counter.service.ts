import { Container, inject, injectable, onInit, Props, state } from 'impair'

@injectable()
export class CounterService {
  constructor(@inject(Container) private container: Container, @inject(Props) public props: { initialCount: number }) {
    console.log('CounterService created: props: ', this.props)
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
