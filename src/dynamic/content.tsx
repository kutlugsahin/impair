import { component, useResolve, useService } from 'impair/index'
import { Route, Switch, useParams, useSearch } from 'wouter'
import { usePathname } from 'wouter/use-browser-location'
import { CounterService } from './counter.service'

export const Content = component(() => {
  const { count, increment } = useService(CounterService)

  const a = useResolve(CounterService)
  // const { user } = useService(UserService)
  const pathname = usePathname()

  console.log('Current Pathname:', pathname)

  console.log('params:', useParams())
  console.log('search:', useSearch())

  return (
    <div>
      <h1>Dynamic Content</h1>
      <div>
        <button onClick={increment}>Counts11: {count}</button>
        <div>
          <button></button>
        </div>
      </div>
      <Switch>
        <Route path="/foo" component={() => <div>Foo Route</div>} />
        <Route path="/bar" component={() => <div>Bar Route</div>} />
      </Switch>
    </div>
  )
})
