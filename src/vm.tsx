import {
  type Cleanup,
  Container,
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
  ViewProps,
} from 'impair'

import { QueryService } from '../lib/impair-query/src/queryService'

export type Post = {
  id: number
  title: string
  body: string
}

@injectable()
export class QueryPost extends QueryService<Post, [id: number]> {
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

export type PostProps = {
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
export class PostViewModel {
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
    @inject(Symbol.for('deneme')) public reactive: { value: number },
  ) {
    console.log(this.container)
  }

  @trigger
  logValue() {
    console.log('logValue', this.reactive.value)
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

  public setSelectedId(id: number) {
    this.selectedId = id
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
}
