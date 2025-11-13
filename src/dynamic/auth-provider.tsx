import { PropsWithChildren } from 'react'
import { Authorization } from './authorization'
import { ServiceProvider } from 'impair/index'
import { AuthService } from './auth-service'

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <ServiceProvider provide={[AuthService]}>
      <Authorization>{children}</Authorization>
    </ServiceProvider>
  )
}
