import { QueryClient } from '@tanstack/react-query'

let defaultClient: QueryClient | undefined

/**
 * Register the QueryClient used by every query that doesn't provide its own.
 * Call once at app startup (the same client you pass to `<QueryClientProvider>`).
 *
 * The client is read lazily — only when a query first observes — so the order of
 * `setQueryClient` vs. service construction doesn't matter, and tests can swap the
 * client between runs.
 */
export function setQueryClient(client: QueryClient) {
  defaultClient = client
}

export function getDefaultQueryClient(): QueryClient | undefined {
  return defaultClient
}
