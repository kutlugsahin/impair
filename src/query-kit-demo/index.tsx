import { component, injectable, state, trigger, useViewModel } from 'impair'
import { mutation, query, setQueryClient, type Mutation, type Query, type QueryType } from 'impair-query'
import { QueryClient } from '@tanstack/react-query'

// impair-query reads its client lazily — set it once for the demo. In a real app you'd
// call this at startup with the same client you pass to <QueryClientProvider>.
setQueryClient(new QueryClient())

const api = 'https://jsonplaceholder.typicode.com'

async function getComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`${api}/posts/${postId}/comments`)
  if (!response.ok) {
    throw new Error(`Failed to fetch comments for post ${postId}: ${response.statusText}`)
  }
  return response.json()
}

type Post = { id: number; title: string; body: string }
type Comment = { id: number; name: string; email: string; body: string }

@injectable()
class PostDashboardViewModel {
  @state
  selectedId = 1

  // Two independent queries on the SAME service — the thing single-inheritance couldn't do.
  @query<Post, [number]>({
    key: 'post',
    fetch: (id) => fetch(`${api}/posts/${id}`).then((r) => r.json()),
  })
  post!: Query<Post, [number]>

  @query({
    key: 'comments',
    fetch: getComments,
  })
  comments!: QueryType<typeof getComments>

  @state
  draft = ''

  // A mutation living right next to the queries it affects. On success it invalidates the
  // 'post' query, so the post above refetches. (jsonplaceholder fakes the PATCH — it echoes
  // the new title in the mutation result but doesn't persist, so the refetch shows the original.)
  @mutation<Post, { id: number; title: string }>({
    mutationFn: ({ id, title }) =>
      fetch(`${api}/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }).then((r) => r.json()),
    invalidates: ['post'],
  })
  saveTitle!: Mutation<Post, { id: number; title: string }>

  // One trigger drives both queries whenever the selection changes.
  @trigger
  load() {
    this.post.run(this.selectedId)
    this.comments.run(this.selectedId)
  }

  next() {
    this.selectedId++
  }

  prev() {
    this.selectedId = Math.max(1, this.selectedId - 1)
  }

  setDraft(value: string) {
    this.draft = value
  }

  save() {
    this.saveTitle.mutate({ id: this.selectedId, title: this.draft })
  }
}

export const QueryKitDemo = component(function QueryKitDemo() {
  const vm = useViewModel(PostDashboardViewModel)
  const { post, comments, saveTitle } = vm

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '40px auto', lineHeight: 1.5 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={vm.prev}>‹ Prev</button>
        <strong>Post #{vm.selectedId}</strong>
        <button onClick={vm.next}>Next ›</button>
        <button onClick={() => post.refetch()} disabled={post.isFetching}>
          {post.isFetching ? 'Refetching…' : 'Refetch'}
        </button>
      </div>

      <section style={{ marginTop: 16, opacity: post.isFetching ? 0.6 : 1 }}>
        {post.isPending && <p>Loading post…</p>}
        {post.isError && <p style={{ color: 'crimson' }}>{post.error?.message}</p>}
        {post.data && (
          <article>
            <h2 style={{ marginBottom: 4 }}>{post.data.title}</h2>
            <p>{post.data.body}</p>
          </article>
        )}
      </section>

      <section style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={vm.draft}
          placeholder="New title…"
          onChange={(e) => vm.setDraft(e.target.value)}
          style={{ flex: 1, padding: '4px 8px' }}
        />
        <button onClick={vm.save} disabled={saveTitle.isPending || !vm.draft}>
          {saveTitle.isPending ? 'Saving…' : 'Save title'}
        </button>
      </section>
      {saveTitle.isSuccess && <small style={{ color: 'green' }}>Saved “{saveTitle.data?.title}”</small>}
      {saveTitle.isError && <small style={{ color: 'crimson' }}>{saveTitle.error?.message}</small>}

      <section style={{ marginTop: 24 }}>
        <h3>Comments {comments.isFetching && <small>(updating…)</small>}</h3>
        {comments.isPending && <p>Loading comments…</p>}
        <ul>
          {comments.data?.map((c) => (
            <li key={c.id} style={{ marginBottom: 8 }}>
              <strong>{c.email}</strong>: {c.body}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
})
