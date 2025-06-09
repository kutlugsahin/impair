import { type PropsWithChildren } from 'react'

import { useRegisteredContainer } from '../container/useRegisteredContainer'
import { Context } from '../context/context'
import type { ProviderProps } from '../types'

export function ServiceProvider<P extends object>({
  provide,
  children,
  props,
  initializeSingletons,
}: PropsWithChildren<ProviderProps<P>>) {
  const container = useRegisteredContainer({
    services: provide,
    props,
    initializeSingletons,
  })

  return <Context.Provider value={container}>{children}</Context.Provider>
}
