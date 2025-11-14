import { createContext, useContext } from 'react'
import { container, DependencyContainer } from 'tsyringe'
import { createChildContainer } from '../container/createChildContainer'
import { Container } from '../injectables/container'
import { Props } from '../injectables/tokens'

export const globalContainer = createChildContainer(container, () => {
  // No-op for global container
})

globalContainer.register(Props, { useValue: {} })
globalContainer.register(Container, { useValue: new Container(globalContainer) })

// Override dispose to no-op to prevent disposal of the default container
globalContainer.dispose = () => {
  console.warn('Default container dispose called - operation ignored.')
}

export const Context = createContext<DependencyContainer>(globalContainer)

export function useDependencyContainer() {
  return useContext(Context)
}
