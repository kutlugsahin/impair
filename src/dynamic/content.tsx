import { component, useService } from 'impair/index'
import { CounterService } from './counter.service'
import { UserService } from './user-service'

export const Content = component(() => {
  const { count, increment } = useService(CounterService)
  // const { user } = useService(UserService)

  return (
    <div>
      <h1>Dynamic Content</h1>
      <div>
        <button onClick={increment}>Counts11: {count}</button>
      </div>
    </div>
  )
})
