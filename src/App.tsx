import { component, inject, injectable, onDispose, onInit, onUnmount, Props, provide, state, trigger } from 'impair'
import { onMount } from 'impair/lifecycle/onMount'
import { QueryService } from '../lib/impair-query/src/queryService'

import { useState } from 'react'

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
    console.log('onMunt query')

    return () => {
      console.log('onMunt > unmount query')
    }
  }

  @onInit
  onInit() {
    console.log('onInit query')
  }
}

type PostProps = {
  id: number
}

@provide([[QueryPost, 'transient']])
@injectable()
class PostViewModel {
  @state
  selectedId = 1

  constructor(
    @inject(QueryPost) public posts: QueryPost,
    @inject(QueryPost) public posts2: QueryPost,
    @inject(Props) public props: PostProps,
  ) {}

  @trigger.async
  querySelectedPost() {
    this.posts.query(this.selectedId)
  }

  @trigger
  querySelectedPost2() {
    const id = this.selectedId + 1

    this.posts2.query(id)

    return () => {
      console.log('querySelectedPost2', id)
    }
  }

  @onMount
  protected mounted() {
    console.log('mounted')

    return () => {
      console.log('mounted > unmounted')
    }
  }

  @onUnmount
  protected unmount() {
    console.log('unmount')
  }

  @onInit
  protected init() {
    console.log('init')
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
              this.selectedId++
              this.selectedId++
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
      {show && <PostsComponent id={5} />}
    </div>
  )
}
