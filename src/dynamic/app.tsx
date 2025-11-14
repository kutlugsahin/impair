import { ServiceProvider } from 'impair/index'
import { lazy } from 'react'

import { AuthProvider } from './auth-provider'
import { CounterService } from './counter.service'
import { InterceptorProvider } from './interceptor-provider'
import { Navigation } from './nav'
import { UserService } from './user-service'
// import { Content } from './content'
import { Link, Route, Switch } from 'wouter'
const Content = lazy(() => import('./content').then((m) => ({ default: m.Content })))

export default function App() {
  return (
    <InterceptorProvider>
      <AuthProvider>
        <ServiceProvider provide={[UserService, CounterService]} props={{ userId: 42 }}>
          <div>
            <Link to="/app">Goto Content</Link>
            <Navigation />
            <div>
              <Switch>
                <Route path="/" component={() => <div>Home</div>} />
                <Route path="/app" component={Content} />
              </Switch>
            </div>
          </div>
        </ServiceProvider>
      </AuthProvider>
    </InterceptorProvider>
  )
}
