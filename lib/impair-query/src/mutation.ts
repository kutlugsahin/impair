import { createDecorator } from 'impair'

import { createMutation } from './createMutation'
import { MutationDefinition } from './types'

/**
 * `@mutation` — field decorator that turns a class property into a reactive mutation unit.
 *
 * Symmetric with `@query`: one service can own as many mutations as it likes, each a
 * self-contained reactive unit, disposed with the owning container.
 *
 * ```ts
 * @injectable()
 * class PostEditorService {
 *   @mutation<Post, NewPost>({
 *     mutationFn: (vars) => api.createPost(vars),
 *     invalidates: ['posts'],                 // refetch these query keys on success
 *     onSuccess: (post) => toast(`Created #${post.id}`),
 *   })
 *   createPost!: Mutation<Post, NewPost>
 *
 *   // this-access side effects: await it in a normal method
 *   async submit(draft: NewPost) {
 *     const post = await this.createPost.mutateAsync(draft)
 *     this.editor.reset()
 *     return post
 *   }
 * }
 * ```
 */
export function mutation<TData, TVariables = void, TError = Error>(
  definition: MutationDefinition<TData, TVariables, TError>,
) {
  const { mutationFn, ...config } = definition

  return createDecorator((instance, propertyKey) => {
    const unit = createMutation<TData, TVariables, TError>(mutationFn, config)
    instance[propertyKey] = unit
    return () => unit.dispose()
  })
}
