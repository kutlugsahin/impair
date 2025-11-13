import { component, useService } from 'impair/index'
import { CountService } from '../props'
import { AuthService } from './auth-service'
import { UserService } from './user-service'

export const Navigation = component(() => {
  const { count } = useService(CountService)
  const { user } = useService(UserService)

  return (
    <button>
      {count} {user?.name}
    </button>
  )
})
