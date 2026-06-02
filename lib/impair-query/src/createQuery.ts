import {
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/react-query'
import { shallowReactive } from '@vue/reactivity'

import { getDefaultQueryClient } from './client'
import { Query, QueryConfig, QueryState } from './types'

function initialState<TData, TError>(): QueryState<TData, TError> {
  return {
    data: undefined,
    error: null,
    status: 'pending',
    fetchStatus: 'idle',
    isPending: true,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    isRefetching: false,
    isStale: false,
    isPlaceholderData: false,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
  }
}

const STATE_KEYS = Object.keys(initialState<unknown, unknown>()) as (keyof QueryState<unknown, unknown>)[]

/**
 * Create a standalone reactive query unit backed by a TanStack `QueryObserver`.
 *
 * Prefer the `@query` decorator for fields on an injectable service (it wires disposal
 * automatically). Use `createQuery` directly when you need a query outside a decorated
 * field — remember to call `dispose()` yourself in that case.
 */
export function createQuery<TData, TParams extends readonly unknown[] = [], TError = Error>(
  fetcher: (...params: TParams) => Promise<TData>,
  config: QueryConfig<TData, TParams, TError> = {},
): Query<TData, TParams, TError> {
  const s = shallowReactive(initialState<TData, TError>())

  let observer: QueryObserver<TData, TError, TData, TData, QueryKey> | undefined
  let unsubscribe: (() => void) | undefined

  function sync(result: QueryObserverResult<TData, TError>) {
    s.data = result.data
    s.error = result.error
    s.status = result.status
    s.fetchStatus = result.fetchStatus
    s.isPending = result.isPending
    s.isLoading = result.isLoading
    s.isFetching = result.isFetching
    s.isSuccess = result.isSuccess
    s.isError = result.isError
    s.isRefetching = result.isRefetching
    s.isStale = result.isStale
    s.isPlaceholderData = result.isPlaceholderData
    s.dataUpdatedAt = result.dataUpdatedAt
    s.errorUpdatedAt = result.errorUpdatedAt
    s.failureCount = result.failureCount
    s.failureReason = result.failureReason
  }

  function resolveKey(params: TParams): QueryKey {
    const key = config.key
    if (typeof key === 'function') return key(...params)
    if (typeof key === 'string') return [key, ...params]
    if (Array.isArray(key)) return [...key, ...params]
    return [...params]
  }

  function resolveClient(): QueryClient {
    const client = config.client ?? getDefaultQueryClient()
    if (!client) {
      throw new Error(
        '[impair-query] No QueryClient available. Call setQueryClient(client) once at startup, ' +
          'or pass { client } in the query config.',
      )
    }
    return client
  }

  function buildOptions(params: TParams): QueryObserverOptions<TData, TError, TData, TData, QueryKey> {
    const queryKey = resolveKey(params)

    if (queryKey.length === 0) {
      throw new Error(
        '[impair-query] A query needs a non-empty key. Provide `key`, or call run() with at least one param.',
      )
    }

    // Strip our own config fields; everything else is forwarded to TanStack verbatim.
    const { key: _key, client: _client, ...options } = config

    return {
      ...(options as QueryObserverOptions<TData, TError, TData, TData, QueryKey>),
      queryKey,
      queryFn: () => fetcher(...params),
    }
  }

  function run(...params: TParams) {
    const options = buildOptions(params)

    if (!observer) {
      // Subscribe once. Seed synchronously from the current result so a cache hit isn't
      // missed in the window before the first async notification.
      observer = new QueryObserver(resolveClient(), options)
      sync(observer.getCurrentResult())
      unsubscribe = observer.subscribe(sync)
    } else {
      // Re-point the existing subscription; seed again to capture a synchronous transition
      // (cache hit / placeholder swap) that setOptions may resolve immediately.
      observer.setOptions(options)
      sync(observer.getCurrentResult())
    }
  }

  async function refetch() {
    await observer?.refetch()
  }

  function reset() {
    unsubscribe?.()
    observer?.destroy()
    observer = undefined
    unsubscribe = undefined
    Object.assign(s, initialState<TData, TError>())
  }

  function dispose() {
    unsubscribe?.()
    observer?.destroy()
    observer = undefined
    unsubscribe = undefined
  }

  const query = { run, refetch, reset, dispose } as Query<TData, TParams, TError>

  // Expose the reactive state as live getters over the internal reactive object.
  for (const k of STATE_KEYS) {
    Object.defineProperty(query, k, {
      enumerable: true,
      get: () => s[k],
    })
  }

  return query
}
