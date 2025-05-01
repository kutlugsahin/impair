import { createContext, useContext } from 'react'
import { container, DependencyContainer } from 'tsyringe'

export const Context = createContext<DependencyContainer>(container)

export function useDependencyContainer() {
  return useContext(Context)
}
