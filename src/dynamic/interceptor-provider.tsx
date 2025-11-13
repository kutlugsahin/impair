import { ServiceProvider } from 'impair/index'
import { IntService } from './int-service'

export function InterceptorProvider({ children }: { children: React.ReactNode }) {
  return (
    <ServiceProvider initializeSingletons provide={[IntService]}>
      {children}
    </ServiceProvider>
  )
}
