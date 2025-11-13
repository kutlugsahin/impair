import { component, useService } from 'impair/index'
import { PropsWithChildren } from 'react'
import { AuthService } from './auth-service'

export const Authorization = component(({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useService(AuthService)

  if (!isAuthenticated) {
    return <div>Loading....</div>
  }

  return children
})
