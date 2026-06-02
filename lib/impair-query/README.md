# impair-query

Composition-first bindings between [TanStack Query](https://tanstack.com/query) and
[impair](https://github.com/kutlugsahin/impair). A query becomes a **reactive field** on any
injectable service — so one service can own as many queries as it needs.

```ts
import { query, type Query } from 'impair-query'

@injectable()
class DashboardService {
  constructor(@inject(Props) private props: { userId: number }) {}

  @query<User, [number]>({ key: 'user', fetch: (id) => fetchUser(id) })
  user!: Query<User, [number]>

  @query<Post[], [number]>({ key: 'posts', fetch: (uid) => fetchPosts(uid) })
  posts!: Query<Post[], [number]>

  @trigger
  load() {
    this.user.run(this.props.userId)
    this.posts.run(this.props.userId)
  }
}
```

In a view, every field read is reactive:

```tsx
const { user, posts } = useService(DashboardService)
// user.data, user.isFetching, user.isPending, user.error, user.refetch() …
```

## Setup

Register the `QueryClient` once at startup (the same one you give `<QueryClientProvider>`):

```ts
import { setQueryClient } from 'impair-query'
import { QueryClient } from '@tanstack/react-query'

setQueryClient(new QueryClient())
```

The client is read **lazily** (only when a query first observes), so call order doesn't matter
and tests can swap clients between runs. You can also override per query with `{ client }`.

## API

### `@query(definition)`

Field decorator. `definition` is `{ fetch, key?, client?, ...tanstackOptions }`:

| field    | meaning                                                                                 |
| -------- | --------------------------------------------------------------------------------------- |
| `fetch`  | `(...params) => Promise<TData>` — the fetcher. Its params are what you pass to `run()`. |
| `key`    | how the query key is built from params (see below). Optional.                           |
| `client` | override the `QueryClient` for this query.                                              |
| `...`    | any `QueryObserverOptions` — `staleTime`, `gcTime`, `enabled`, `retry`, `select`, etc.  |

Disposal is automatic: when the owning service's container is disposed, the observer is torn down.

### `createQuery(fetch, config?)`

The same unit without the decorator, for use outside a decorated field. You own its lifecycle —
call `dispose()` yourself.

### The `Query` unit

Reactive state: `data`, `error`, `status`, `fetchStatus`, `isPending`, `isLoading`, `isFetching`,
`isSuccess`, `isError`, `isRefetching`, `isStale`, `isPlaceholderData`, `dataUpdatedAt`,
`errorUpdatedAt`, `failureCount`, `failureReason`.

Controls: `run(...params)`, `refetch()`, `reset()`, `dispose()`.

> `isLoading` is the first-load flag (`isPending && isFetching`); `isFetching` is true for any
> in-flight fetch including background refetches — use it for "updating…" affordances.

### Deriving the field type from the fetcher

When the fetcher isn't inlined, you don't have to restate its data and param types — derive the
field type from the function with `QueryType`:

```ts
async function getComments(postId: number): Promise<Comment[]> { … }

@query({ key: 'comments', fetch: getComments })   // TData/TParams inferred from getComments
comments!: QueryType<typeof getComments>          // = Query<Comment[], [postId: number]>
```

`MutationType` is the equivalent for mutations (variables = the function's first parameter):

```ts
async function createPost(vars: NewPost): Promise<Post> { … }

@mutation({ mutationFn: createPost, invalidates: ['posts'] })
createPost!: MutationType<typeof createPost>      // = Mutation<Post, NewPost>
```

### Query keys

`key` controls how the TanStack key is derived from the params passed to `run`:

| `key`                       | resulting key                  |
| --------------------------- | ------------------------------ |
| `'posts'` (string)          | `['posts', ...params]`         |
| `['posts', 'list']` (array) | `['posts', 'list', ...params]` |
| `(id) => ['posts', id]`     | `key(...params)`               |
| omitted                     | `[...params]`                  |

## Driving queries

`run()` is imperative by design — call it from a `@trigger` so it re-runs when its reactive inputs
change. The first `run()` creates and subscribes the observer once; later calls just re-point it
(no resubscribe churn), and state is seeded synchronously so cache hits are never dropped.

```ts
@trigger
load() {
  this.post.run(this.selectedId) // re-runs whenever selectedId changes
}
```

## Mutations

`@mutation` is the symmetric counterpart to `@query` — a reactive field backed by a TanStack
`MutationObserver`. A service can own as many as it needs.

```ts
@injectable()
class PostEditorService {
  @mutation<Post, NewPost>({
    mutationFn: (vars) => api.createPost(vars),
    invalidates: ['posts'], // refetch matching query keys on success
    onSuccess: (post) => toast(`Created #${post.id}`),
  })
  createPost!: Mutation<Post, NewPost>

  // this-access side effects: await it in a normal method
  async submit(draft: NewPost) {
    const post = await this.createPost.mutateAsync(draft)
    this.editor.reset()
    return post
  }
}
```

```tsx
const { createPost } = useService(PostEditorService)

<button onClick={() => createPost.mutate(draft)} disabled={createPost.isPending}>
  {createPost.isPending ? 'Saving…' : 'Create'}
</button>
{createPost.isError && <p>{createPost.error.message}</p>}
```

### Config (`MutationDefinition`)

| field         | meaning                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| `mutationFn`  | `(variables) => Promise<TData>` — the work.                                                |
| `invalidates` | a single `QueryKey` (prefix-matched) or `(data, variables) => QueryKey[]`, run on success. |
| `client`      | override the `QueryClient` for this mutation.                                              |
| `...`         | any mutation option — `onMutate`, `onSuccess`, `onError`, `onSettled`, `retry`, `gcTime`.  |

### The `Mutation` unit

Reactive state: `data`, `error`, `variables`, `status` (`'idle' | 'pending' | 'success' | 'error'`),
`isIdle`, `isPending`, `isSuccess`, `isError`, `isPaused`, `failureCount`, `failureReason`,
`submittedAt`.

Controls: `mutate(variables, options?)` (fire-and-forget — outcome lands in the reactive state),
`mutateAsync(variables, options?)` (rejects on error), `reset()`, `dispose()`.

### Reacting after success

| need                    | how                                                            |
| ----------------------- | -------------------------------------------------------------- |
| refetch related queries | `invalidates: ['posts']` (or a fn of the result)               |
| touch service state     | `await this.createPost.mutateAsync(...)` in a method, then act |
| one-off per-call hook   | `mutate(vars, { onSuccess })` — per-call callbacks             |

## Not yet supported

`select` currently keeps the data type (`TData`) — a cross-type `select` needs a cast for now.
