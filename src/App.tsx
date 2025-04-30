import {
  type Cleanup,
  component,
  inject,
  injectable,
  onDispose,
  onInit,
  onUnmount,
  Props,
  provide,
  state,
  trigger,
  useViewModel,
  ViewProps,
} from 'impair'
import { onMount } from 'impair/lifecycle/onMount'
import { useState } from 'react'
import { QueryService } from '../lib/impair-query/src/queryService'

type Post = {
  id: number
  title: string
  body: string
}

@injectable()
class QueryPost extends QueryService<Post, [id: number]> {
  protected key = 'posts'

  protected override async fetch(id: number) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) => r.json())
  }

  @onDispose
  dispose() {
    console.log('dispose query')
  }

  @onUnmount
  onMunt() {
    console.log('onUnmount query')
  }

  @onMount
  onMount(cl: Cleanup) {
    console.log('onMount query')

    cl(() => {
      console.log('onMount query > unmount')
    })
  }

  @onInit
  onInit() {
    console.log('onInit query')
  }
}

type PostProps = {
  id: number
}

@provide([
  [QueryPost, 'transient'],
  {
    token: 't',
    provider: {
      useValue: 'test',
    },
    lifecycle: 'transient',
  },
])
@injectable()
class PostViewModel {
  @state
  selectedId = 1

  @state
  user = {
    name: 'kutlu',
  }

  constructor(
    @inject(QueryPost) public posts: QueryPost,
    @inject(QueryPost) public posts2: QueryPost,
    @inject(ViewProps) public props: PostProps,
  ) {}

  @trigger.async
  querySelectedPost(cleanup: Cleanup) {
    this.posts.query(this.selectedId)

    const id = this.selectedId

    cleanup(() => {
      console.log('cleanup querySelectedPost ' + id)
    })
  }

  @trigger
  querySelectedPost2(cleanup: Cleanup) {
    const id = this.selectedId + 1

    this.posts2.query(id)

    cleanup(() => {
      console.log('cleanup querySelectedPost2 ' + id)
    })
  }

  @onMount
  protected mounted(cleanup: Cleanup) {
    console.log('mounted')

    cleanup(() => {
      console.log('mounted > unmounted')
    })
  }

  @onUnmount
  protected unmount() {
    console.log('unmount')
  }

  @onInit
  protected init(cleanup: Cleanup) {
    console.log('init')

    cleanup(() => {
      console.log('init > unmounted')
    })
  }

  @onDispose
  protected destroy() {
    console.log('destroy')
  }

  dispose() {
    console.log('dispose')
  }

  render() {
    return (
      <div>
        <div>
          <button
            onClick={() => {
              this.selectedId++
            }}
          >
            Inc
          </button>
          <button onClick={() => this.selectedId--}>Dec</button>
        </div>
        <hr />
        <div>
          <h2 className="font-bold">{this.posts.data?.title}</h2>
          <p>{this.posts.data?.body}</p>
        </div>
        <hr />
        <div>
          <h2 className="font-bold">{this.posts2.data?.title}</h2>
          <p>{this.posts2.data?.body}</p>
        </div>
        <hr />
        {this.props.id}
      </div>
    )
  }
}

export const PostsComponent = component.fromViewModel<PostProps>(PostViewModel)

export function Posts() {
  const [show, setShow] = useState(true)

  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      <hr />
      {show && <PostsComponent id={4} />}
    </div>
  )
}

@injectable()
class Service {
  @state
  users = [
    {
      id: 0,
      age: 0,
    },
  ]

  inc(id: number) {
    this.users.find((u) => u.id === id)!.age++
  }

  add() {
    this.users.push({
      id: this.users.length,
      age: 0,
    })
  }
}

export const Posts2 = component(() => {
  const { users, inc, add } = useViewModel(Service)

  return (
    <div>
      <button onClick={add}>add</button>
      {users.map((u) => (
        <div>
          <button onClick={() => inc(u.id)}>{u.age}</button>
        </div>
      ))}
    </div>
  )
})

type Props = {
  id: number
}

@injectable()
class State {
  @state
  count = 0

  inc() {
    this.count++
  }
}

@injectable()
class StateViewModel {
  constructor(@inject(State) public state: State, @inject(Props) private props: Props) {
    console.log('StateViewModel', props.id)
  }

  @trigger
  logCount() {
    console.log('logCount', this.state.count)
  }

  inc() {
    this.state.inc()
  }
}

const C = component(() => {
  const { state, inc } = useViewModel(StateViewModel, { id: 2 })

  return (
    <div>
      <button onClick={inc}>{state.count}</button>
    </div>
  )
})

// export const Posts = component(() => {
//   const [show, setShow] = useState(true)

//   return (
//     <ServiceProvider
//       provide={[State]}
//       props={{
//         id: 5,
//       }}
//     >
//       <div onClick={() => setShow(!show)}>toggle</div>
//       {show && <C />}
//     </ServiceProvider>
//   )
// })
