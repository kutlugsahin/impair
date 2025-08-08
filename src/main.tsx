import { createRoot } from 'react-dom/client'
import 'reflect-metadata'

import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setQueryClient } from '../lib/impair-query/src/index.ts'
import { configure } from '../lib/impair/src/index.ts'
import { Drag } from './resolve-test.tsx'
import { Posts, Posts2 } from './App.tsx'

const client = new QueryClient()

setQueryClient(client)

configure({
  defaultStateReactiveLevel: 'deep',
  readonlyProxiesForView: true,
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={client}>
    <Posts />
  </QueryClientProvider>,
)
