import {
  component,
  componentWithServices,
  derived,
  inject,
  injectable,
  Props,
  ServiceProvider,
  state,
  useService,
  useViewModel,
  ViewProps,
} from 'impair/index'

type ServiceProps = {
  id: number
}

@injectable()
export class CountService {
  @state
  count: number = 4

  constructor(@inject(Props) props: ServiceProps) {
    console.log('CountService props', props)
  }

  inc() {
    this.count++
  }
}

@injectable()
export class CountViewModel {
  constructor(@inject(Props) private props: CompProps) {}

  @derived
  get count() {
    return this.props.count
  }
}

export const App = component(() => {
  return (
    <ServiceProvider provide={[CountService]} props={{ id: 4 }}>
      <Comp count={3} />
    </ServiceProvider>
  )
})

type CompProps = {
  count: number
}

const Comp = component<CompProps>(() => {
  const { count } = useViewModel(CountViewModel)
  const { count: c1, inc } = useService(CountService)

  return (
    <div>
      <button>{count}</button>
      <button onClick={() => inc()}>{c1}</button>
    </div>
  )
})
