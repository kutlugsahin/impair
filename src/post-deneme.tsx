import 'reflect-metadata'

import { component, injectable, ServiceProvider, state, trigger, type Cleanup, useService, useViewModel } from 'impair'
import './App.css'

export function PostDeneme() {
  return (
    // <ServiceProvider provide={[PostsService]}>
    <Posts />
    // </ServiceProvider>
  )
}

@injectable()
class CounterService {
  @state
  count = 0

  inc() {
    this.count++
  }
}

const Counter = component(() => {
  const { count, inc } = useViewModel(CounterService)

  return <button onClick={inc}>{count}</button>
})

// --- Posts Service & Component ---

type Post = {
  userId: number
  id: number
  title: string
  body: string
}

@injectable()
class PostsService {
  // The ID of the post to fetch
  @state
  postId: number = 1

  // Remote data & request state
  @state
  post: Post | null = null

  @state
  loading: boolean = false

  @state
  error: string | null = null

  setPostId(id: number) {
    this.postId = id
  }

  constructor() {
    console.log('PostsService initialized')
  }

  @trigger
  async fetchCurrentPost(cleanup: Cleanup) {
    const id = this.postId // reference reactive dependency
    if (!id || id < 1) return

    const controller = new AbortController()
    cleanup(() => controller.abort())

    this.loading = true
    this.error = null
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Post
      this.post = data
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // ignore aborts
        return
      }
      const msg = e instanceof Error ? e.message : 'Unknown error'
      this.error = msg
      this.post = null
    } finally {
      this.loading = false
    }
  }
}

const Posts = component(() => {
  const svc = useViewModel(PostsService)

  const next = () => svc.setPostId(Math.max(1, (svc.postId ?? 1) + 1))
  const prev = () => svc.setPostId(Math.max(1, (svc.postId ?? 1) - 1))

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={prev}>Prev</button>
        <span>Post ID:</span>
        <input
          type="number"
          min={1}
          value={svc.postId}
          onChange={(e) => svc.setPostId(Number(e.currentTarget.value))}
          style={{ width: 64 }}
        />
        <button onClick={next}>Next</button>
      </div>

      {svc.loading && <p>Loading…</p>}
      {svc.error && <p style={{ color: 'red' }}>Error: {svc.error}</p>}
      {svc.post && !svc.loading && !svc.error && (
        <div style={{ textAlign: 'left', marginTop: 8 }}>
          <h3>{svc.post.title}</h3>
          <p>{svc.post.body}</p>
        </div>
      )}
    </div>
  )
})


