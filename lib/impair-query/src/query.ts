import { createDecorator } from 'impair'

import { createQuery } from './createQuery'
import { QueryDefinition } from './types'

/**
 * `@query` — field decorator that turns a class property into a reactive query unit.
 *
 * Unlike a base class, a single service can own as many queries as it likes, each a
 * self-contained reactive unit. Disposal is wired through impair's lifecycle: when the
 * owning service's container is disposed, the query's observer is torn down.
 *
 * ```ts
 * @injectable()
 * class DashboardService {
 *   constructor(@inject(Props) private props: { userId: number }) {}
 *
 *   @query<User, [number]>({ key: 'user', fetch: (id) => fetchUser(id) })
 *   user!: Query<User, [number]>
 *
 *   @query<Post[], [number]>({ key: 'posts', fetch: (uid) => fetchPosts(uid) })
 *   posts!: Query<Post[], [number]>
 *
 *   @trigger
 *   load() {
 *     this.user.run(this.props.userId)
 *     this.posts.run(this.props.userId)
 *   }
 * }
 * ```
 */
export function query<TData, TParams extends readonly unknown[] = [], TError = Error>(
  definition: QueryDefinition<TData, TParams, TError>,
) {
  const { fetch, ...config } = definition

  return createDecorator((instance, propertyKey) => {
    const unit = createQuery<TData, TParams, TError>(fetch, config)
    instance[propertyKey] = unit
    return () => unit.dispose()
  })
}
