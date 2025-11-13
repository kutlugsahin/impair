import { ServiceProvider } from 'impair/index'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { AuthProvider } from './auth-provider'
import { Content } from './content'
import { CounterService } from './counter.service'
import { InterceptorProvider } from './interceptor-provider'
import { Navigation } from './nav'
import { UserService } from './user-service'
// import { Content } from './content'

// const Content = lazy(() => import('./content').then((m) => ({ default: m.Content })))

export default function App() {
  return (
    <BrowserRouter>
      <InterceptorProvider>
        <AuthProvider>
          <ServiceProvider provide={[UserService, CounterService]}>
            <div>
              <Link to="/app">Goto Content</Link>
              <Navigation />
              <div>
                <Routes>
                  <Route path="/" element={<div>Home</div>} />
                  <Route path="/app" element={<Content />} />
                </Routes>
              </div>
            </div>
          </ServiceProvider>
        </AuthProvider>
      </InterceptorProvider>
    </BrowserRouter>
  )
}
