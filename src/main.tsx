import { createRoot } from 'react-dom/client'
import 'reflect-metadata'

import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setQueryClient } from 'impair-query'
import { configure } from 'impair'
import { Drag, ResolveTest } from './resolve-test.tsx'
import { Posts, Posts2 } from './App.tsx'
import { PostDeneme } from './post-deneme.tsx'
import { StrictMode } from 'react'
// import { App } from './props.tsx'
import { App } from './provide.tsx'
// import { App } from './trigger.tsx'
import Dynamic from './dynamic/app.tsx'

const client = new QueryClient()

setQueryClient(client)

configure({
  defaultStateReactiveLevel: 'deep',
  readonlyProxiesForView: true,
})

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={client}>
    <Dynamic />
  </QueryClientProvider>,
  // </StrictMode>,
)
