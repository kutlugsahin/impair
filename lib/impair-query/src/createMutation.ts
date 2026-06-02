import {
  MutateOptions,
  MutationObserver,
  MutationObserverOptions,
  MutationObserverResult,
  QueryClient,
} from '@tanstack/react-query'
import { shallowReactive } from '@vue/reactivity'

import { getDefaultQueryClient } from './client'
import { Mutation, MutationConfig, MutationState } from './types'

function initialState<TData, TVariables, TError>(): MutationState<TData, TVariables, TError> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    status: 'idle',
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
    isPaused: false,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  }
}

const STATE_KEYS = Object.keys(
  initialState<unknown, unknown, unknown>(),
) as (keyof MutationState<unknown, unknown, unknown>)[]

/**
 * Create a standalone reactive mutation unit backed by a TanStack `MutationObserver`.
 *
 * Prefer the `@mutation` decorator for fields on an injectable service (it wires disposal
 * automatically). Use `createMutation` directly when you need a mutation outside a decorated
 * field — remember to call `dispose()` yourself in that case.
 */
export function createMutation<TData, TVariables = void, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: MutationConfig<TData, TVariables, TError> = {},
): Mutation<TData, TVariables, TError> {
  const s = shallowReactive(initialState<TData, TVariables, TError>())

  const { client: clientOverride, invalidates, ...options } = config

  let observer: MutationObserver<TData, TError, TVariables, unknown> | undefined
  let unsubscribe: (() => void) | undefined

  function resolveClient(): QueryClient {
    const client = clientOverride ?? getDefaultQueryClient()
    if (!client) {
      throw new Error(
        '[impair-query] No QueryClient available. Call setQueryClient(client) once at startup, ' +
          'or pass { client } in the mutation config.',
      )
    }
    return client
  }

  function sync(result: MutationObserverResult<TData, TError, TVariables, unknown>) {
    s.data = result.data
    s.error = result.error
    s.variables = result.variables
    s.status = result.status
    s.isIdle = result.isIdle
    s.isPending = result.isPending
    s.isSuccess = result.isSuccess
    s.isError = result.isError
    s.isPaused = result.isPaused
    s.failureCount = result.failureCount
    s.failureReason = result.failureReason
    s.submittedAt = result.submittedAt
  }

  function buildOptions(client: QueryClient): MutationObserverOptions<TData, TError, TVariables, unknown> {
    return {
      ...(options as MutationObserverOptions<TData, TError, TVariables, unknown>),
      mutationFn,
      onSuccess: async (data, variables, context) => {
        if (invalidates) {
          const keys = typeof invalidates === 'function' ? invalidates(data, variables) : [invalidates]
          await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })))
        }
        return options.onSuccess?.(data, variables, context)
      },
    }
  }

  // Lazily build the observer on first use, matching createQuery — the client need only exist
  // by the time a mutation actually fires.
  function ensureObserver(): MutationObserver<TData, TError, TVariables, unknown> {
    if (!observer) {
      const client = resolveClient()
      observer = new MutationObserver<TData, TError, TVariables, unknown>(client, buildOptions(client))
      sync(observer.getCurrentResult())
      unsubscribe = observer.subscribe(sync)
    }
    return observer
  }

  function mutate(variables: TVariables, opts?: MutateOptions<TData, TError, TVariables>) {
    // Fire-and-forget — the rejection is reflected in the reactive error state.
    void ensureObserver().mutate(variables, opts).catch(() => {})
  }

  function mutateAsync(variables: TVariables, opts?: MutateOptions<TData, TError, TVariables>) {
    return ensureObserver().mutate(variables, opts)
  }

  function reset() {
    observer?.reset()
  }

  function dispose() {
    unsubscribe?.()
    observer = undefined
    unsubscribe = undefined
  }

  const mutation = { mutate, mutateAsync, reset, dispose } as Mutation<TData, TVariables, TError>

  for (const k of STATE_KEYS) {
    Object.defineProperty(mutation, k, {
      enumerable: true,
      get: () => s[k],
    })
  }

  return mutation
}
