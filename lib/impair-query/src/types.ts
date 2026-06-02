import {
  MutateOptions,
  MutationObserverOptions,
  QueryClient,
  QueryKey,
  QueryObserverOptions,
} from '@tanstack/react-query'

export type QueryStatus = 'pending' | 'error' | 'success'
export type FetchStatus = 'fetching' | 'paused' | 'idle'

/**
 * The reactive snapshot mirrored from a TanStack `QueryObserver`. Every field is a
 * reactive read — touching it inside a component render (or a `@trigger`/`@derived`)
 * subscribes to its changes.
 */
export interface QueryState<TData, TError> {
  data: TData | undefined
  error: TError | null
  status: QueryStatus
  fetchStatus: FetchStatus
  /** No data yet (first load or disabled). */
  isPending: boolean
  /** First load in flight: `isPending && isFetching`. */
  isLoading: boolean
  /** Any fetch in flight, including background refetches. */
  isFetching: boolean
  isSuccess: boolean
  isError: boolean
  /** A background refetch of already-resolved data. */
  isRefetching: boolean
  isStale: boolean
  /** `data` is placeholder/previous data, not the result for the current key. */
  isPlaceholderData: boolean
  dataUpdatedAt: number
  errorUpdatedAt: number
  failureCount: number
  failureReason: TError | null
}

/** A query unit: reactive state plus the imperative controls to drive it. */
export interface Query<TData, TParams extends readonly unknown[] = [], TError = Error>
  extends QueryState<TData, TError> {
  /**
   * Start (or re-point) the underlying observer with the given params. Idempotent for the
   * same key — typically called from a `@trigger` so it re-runs when reactive inputs change.
   */
  run(...params: TParams): void
  /** Imperatively refetch the current query. */
  refetch(): Promise<void>
  /** Tear down the observer and reset state to its initial (pending) values. */
  reset(): void
  /** Tear down the observer. Called automatically when the owning service is disposed. */
  dispose(): void
}

/**
 * How the TanStack query key is derived from the params passed to `run`:
 * - `string`  → `[key, ...params]`
 * - `QueryKey` → `[...key, ...params]`
 * - function  → `key(...params)` (full control)
 * - omitted   → `[...params]`
 */
export type QueryKeyInput<TParams extends readonly unknown[]> =
  | string
  | QueryKey
  | ((...params: TParams) => QueryKey)

/** Pass-through TanStack options (staleTime, gcTime, enabled, retry, select, …). */
export type QueryOptions<TData, TError> = Omit<
  QueryObserverOptions<TData, TError, TData, TData, QueryKey>,
  'queryKey' | 'queryFn'
>

export type QueryConfig<TData, TParams extends readonly unknown[], TError> = QueryOptions<TData, TError> & {
  key?: QueryKeyInput<TParams>
  /** Override the QueryClient for this query (defaults to the one set via `setQueryClient`). */
  client?: QueryClient
}

/** Config for the `@query` decorator — same as `QueryConfig` plus the fetcher. */
export type QueryDefinition<TData, TParams extends readonly unknown[], TError> = QueryConfig<
  TData,
  TParams,
  TError
> & {
  fetch: (...params: TParams) => Promise<TData>
}

/**
 * Derive a `Query` type from a (non-inlined) fetch function. Saves restating the data and
 * param types: with `getComments: (postId: number) => Promise<Comment[]>`,
 * `QueryType<typeof getComments>` expands to `Query<Comment[], [postId: number]>`.
 */
export type QueryType<TFetch extends (...args: never[]) => Promise<unknown>, TError = Error> = Query<
  Awaited<ReturnType<TFetch>>,
  Parameters<TFetch>,
  TError
>

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * The reactive snapshot mirrored from a TanStack `MutationObserver`. Like the query state,
 * every field is a reactive read.
 */
export interface MutationState<TData, TVariables, TError> {
  /** The last successfully resolved result. */
  data: TData | undefined
  error: TError | null
  /** The variables of the most recent `mutate` call. */
  variables: TVariables | undefined
  status: MutationStatus
  /** Initial state, before any `mutate` call. */
  isIdle: boolean
  /** A mutation is currently in flight. */
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  /** Paused while offline (networkMode). */
  isPaused: boolean
  failureCount: number
  failureReason: TError | null
  submittedAt: number
}

/** A mutation unit: reactive state plus the controls to fire and reset it. */
export interface Mutation<TData, TVariables = void, TError = Error>
  extends MutationState<TData, TVariables, TError> {
  /** Fire the mutation (fire-and-forget — outcome is reflected in the reactive state). */
  mutate(variables: TVariables, options?: MutateOptions<TData, TError, TVariables>): void
  /** Fire the mutation and await it. Rejects on error (unlike `mutate`). */
  mutateAsync(variables: TVariables, options?: MutateOptions<TData, TError, TVariables>): Promise<TData>
  /** Reset to idle, clearing data/error. */
  reset(): void
  /** Tear down the observer. Called automatically when the owning service is disposed. */
  dispose(): void
}

/** Pass-through TanStack mutation options (onMutate, onError, retry, gcTime, mutationKey, …). */
export type MutationOptions<TData, TVariables, TError> = Omit<
  MutationObserverOptions<TData, TError, TVariables, unknown>,
  'mutationFn'
>

export type MutationConfig<TData, TVariables, TError> = MutationOptions<TData, TVariables, TError> & {
  /**
   * Query key(s) to invalidate on success — convenience over `client.invalidateQueries`.
   * A single key (prefix-matched) for the common case, or a function returning many:
   * `invalidates: ['posts']` or `invalidates: (data) => [['post', data.id], ['posts']]`.
   */
  invalidates?: QueryKey | ((data: TData, variables: TVariables) => QueryKey[])
  /** Override the QueryClient for this mutation (defaults to the one set via `setQueryClient`). */
  client?: QueryClient
}

/** Config for the `@mutation` decorator — same as `MutationConfig` plus the mutation function. */
export type MutationDefinition<TData, TVariables, TError> = MutationConfig<TData, TVariables, TError> & {
  mutationFn: (variables: TVariables) => Promise<TData>
}

/**
 * Derive a `Mutation` type from a (non-inlined) mutation function. The variables type is the
 * function's first parameter (or `void` if it takes none): with
 * `createPost: (vars: NewPost) => Promise<Post>`, `MutationType<typeof createPost>` expands to
 * `Mutation<Post, NewPost>`.
 */
export type MutationType<TFn extends (...args: never[]) => Promise<unknown>, TError = Error> = Mutation<
  Awaited<ReturnType<TFn>>,
  Parameters<TFn> extends [infer V, ...never[]] ? V : void,
  TError
>
