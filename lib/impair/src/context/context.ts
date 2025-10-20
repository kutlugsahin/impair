import { createContext, useContext } from 'react'
import { createChildContainer } from '../container/createChildContainer'
import { initInstance } from '../container/initInstance'
import { container, DependencyContainer } from 'tsyringe'
import { Props, ViewProps } from '../injectables/tokens'
import { Container } from '../injectables/container'

export const globalContainer = createChildContainer(container, (instance) => {
  initInstance(instance)
})

globalContainer.register(Props, { useValue: {} })
globalContainer.register(ViewProps, { useValue: {} })
globalContainer.register(Container, { useValue: new Container(globalContainer) })

// Override dispose to no-op to prevent disposal of the default container
globalContainer.dispose = () => {
  console.warn('Default container dispose called - operation ignored.')
}

export const Context = createContext<DependencyContainer>(globalContainer)

export function useDependencyContainer() {
  return useContext(Context)
}
