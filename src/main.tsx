import 'reflect-metadata'
import { createRoot } from 'react-dom/client'

import { Posts } from './App.tsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setQueryClient } from '../lib/impair-query/src/index.ts'

const client = new QueryClient()

setQueryClient(client)

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={client}>
    <Posts id={6} />
  </QueryClientProvider>
)
