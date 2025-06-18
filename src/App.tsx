import {
  component,
  createDecorator,
  derived,
  inject,
  injectable,
  onInit,
  onMount,
  Props,
  ServiceProvider,
  state,
  trigger,
  useResolve,
  useViewModel,
  ViewProps,
} from 'impair'

import { useEffect, useState } from 'react'
import { PostProps, PostViewModel, QueryPost } from './vm'
import { Vm2 } from './vm2'

export const PostsComponent = component<PostProps>(() => {
  const { selectedId, setSelectedId, posts, posts2, props } = useViewModel(PostViewModel)

  return (
    <div>
      <div>
        <button
          onClick={() => {
            setSelectedId(selectedId + 1)
          }}
        >
          Inc2
        </button>
        <button
          onClick={() => {
            setSelectedId(selectedId - 1)
          }}
        >
          Dec
        </button>
      </div>
      <hr />
      <div>
        <h2 className="font-bold">{posts.data?.title}</h2>
        <p>{posts.data?.body}</p>
      </div>
      <hr />
      <div>
        <h2 className="font-bold">{posts2.data?.title}</h2>
        <p>{posts2.data?.body}</p>
      </div>
      <hr />
      {props.id}
    </div>
  )
})

export function Posts() {
  const [show, setShow] = useState(true)

  const [value, setValue] = useState(10)

  useEffect(() => {
    console.log('Posts mounted')
    return () => {
      console.log('Posts unmounted')
    }
  }, [])

  return (
    <ServiceProvider
      provide={[
        Vm2,
        [QueryPost, 'transient'],
        [
          Symbol.for('deneme'),
          {
            value,
          },
        ],
      ]}
      props={{ id: 44 }}
    >
      <div>
        <button onClick={() => setValue(value + 1)}>inc value: {value}</button>
        <button onClick={() => setShow(!show)}>Toggle</button>
        <hr />
        {show && (
          <div>
            <PostsComponent id={40} />
          </div>
        )}
      </div>
    </ServiceProvider>
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

  @onInit
  onInit() {
    console.log('onInit', this.count)
  }
}

@injectable()
class Derived extends Base {
  inc() {
    this.count++
  }

  constructor(@inject(Props) public props: any, @inject(ViewProps) public viewprops: any) {
    super()
    console.log('Derived constructor', this.props, this.viewprops)
  }

  @trigger.async
  logCount() {
    console.log('Derived logCount', this.count)
  }

  @onInit
  onInit() {
    console.log('Derived onInit', this.count)
  }
}

export const C = component(({ id }: { id: number }) => {
  // useViewModel(PostViewModel)
  // const { state, inc, age1, age2, num, num2 } = useViewModel(StateViewModel)
  // const vm = useViewModel(StateViewModel)

  // const derived = useViewModel(Derived)
  const derived = useResolve(Derived, { asdasd: 213 })
  useResolve(Derived, { qweqweq: 'asdsad' })

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
