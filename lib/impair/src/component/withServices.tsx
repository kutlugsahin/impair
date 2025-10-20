import { FC } from 'react'
import { ServiceProvider } from '../provider/serviceProvider'
import { ProviderProps } from '../types'
import { component } from './component'

export function componentWithServices(...providers: ProviderProps['provide']) {
  return <P extends object>(cmp: FC<P>): FC<P> => {
    const Child = component(cmp)
    const Component: FC<P> = (props: P) => {
      return (
        <ServiceProvider provide={providers}>
          <Child {...props} />
        </ServiceProvider>
      )
    }

    Component.displayName = cmp.displayName || cmp.name || 'ComponentWithServices'
    return Component
  }
}
