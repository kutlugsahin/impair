import { createRoot } from 'react-dom/client'
import 'reflect-metadata'

import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setQueryClient } from '../lib/impair-query/src/index.ts'
import { configure } from '../lib/impair/src/index.ts'
import { Posts } from './App.tsx'
import { ResolveTest } from './resolve-test.tsx'

const client = new QueryClient()

setQueryClient(client)

configure({
  defaultStateReactiveLevel: 'shallow',
  readonlyProxiesForView: false,
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={client}>
    <ResolveTest />
  </QueryClientProvider>,
)
