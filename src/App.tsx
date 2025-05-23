import {
  type Cleanup,
  component,
  Container,
  createDecorator,
  derived,
  inject,
  injectable,
  onDispose,
  onInit,
  onMount,
  onUnmount,
  Props,
  provide,
  state,
  trigger,
  useViewModel,
  ViewProps,
} from 'impair'

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
  // [QueryPost, 'transient'],
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
    @inject(Container) public container: Container,
  ) {
    console.log(this.container)
  }

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

const obs = createDecorator((instance, key, { shallowRef }) => {
  const val = shallowRef(instance[key])

  setInterval(() => {
    val.value++
  }, 1000)

  Object.defineProperty(instance, key, {
    get() {
      return val.value
    },
    set(newValue) {
      val.value = newValue
    },
  })
})

function obs2() {
  return createDecorator((instance, key, { shallowRef }) => {
    const val = shallowRef(instance[key])

    setInterval(() => {
      val.value++
    }, 1000)

    Object.defineProperty(instance, key, {
      get() {
        return val.value
      },
      set(newValue) {
        val.value = newValue
      },
    })
  })
}

@injectable()
class StateViewModel<T> {
  @state
  age = 0

  constructor(@inject(State) public state: State, @inject(ViewProps) private props: Props) {
    console.log('StateViewModel', props.id)
  }

  @derived get age2() {
    return this.age1 + 2
  }

  @derived get age1() {
    return this.age + 1
  }

  @obs
  num = 10

  @obs2()
  num2 = 5

  @trigger
  logCount() {
    console.log('logCount', this.state.count)
  }

  @onMount
  onMount() {
    console.log('onMount', this.state.count)
  }

  inc() {
    this.state.inc()
    this.age++
  }
}

@injectable()
class Base {
  @state
  count = 0

  @trigger
  logCount() {
    console.log('logCount', this.count)
  }
}

@injectable()
class Derived extends Base {
  inc() {
    this.count++
  }

  @trigger.async
  logCount2() {
    console.log('Derived logCount', this.count)
  }
}

export const C = component(({ id }: { id: number }) => {
  // useViewModel(PostViewModel)
  // const { state, inc, age1, age2, num, num2 } = useViewModel(StateViewModel)
  // const vm = useViewModel(StateViewModel)

  const derived = useViewModel(Derived)

  return (
    <div>
      {/* <button onClick={inc}>{age2}</button>
      <button onClick={vm.inc}>{vm.age2}</button>
      <button>
        {num} / {vm.num}
      </button>
      <button>
        {num2} / {vm.num2}
      </button> */}
      <div>
        <button onClick={derived.inc}>{derived.count}</button>
      </div>
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

// const map = new Map([
//   [1, 2],
//   [2, 3],
//   [3, 4],
// ])

// const set = new Set([1, 2, 3, 4])

// const obj = {
//   a: reactive(set),
//   b: reactive(map),
// }
// const obj2 = [reactive(set), reactive(map)]

// const obj3 = reactive(obj)

// const obj4 = reactive({
//   a: reactive(set),
//   b: reactive(map),
// })

// const a = toRaw(obj)

// console.log(obj)

// const b = toRaw(obj2)
// const c = toRaw(obj3)
// const d = toRaw(obj4)

// console.log(a === obj)
// console.log(set === obj.a)
// console.log(map === obj.b)
// console.log(a.a === obj.a)
// console.log(a.b === obj.b)

// console.log(b[0] === obj2[0])
// console.log(b[1] === obj2[1])
// console.log(b === obj2)

// console.log(c === obj3)
// console.log(c.a === obj3.a)
// console.log(c.b === obj3.b)

// console.log(d === obj4)
// console.log(d.a === obj4.a)
// console.log(d.b === obj4.b)
// console.log(d.a === obj4.a)
