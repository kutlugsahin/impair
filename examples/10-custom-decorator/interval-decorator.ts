import { createDecorator } from 'impair'

/**
 * Field decorator: every `ms` milliseconds, increment the field's value.
 * The interval is cancelled when the instance is disposed.
 */
export function interval(ms: number) {
  return createDecorator((instance, key, { shallowRef }) => {
    const ref = shallowRef<number>(instance[key])

    const handle = setInterval(() => {
      ref.value++
    }, ms)

    Object.defineProperty(instance, key, {
      configurable: true,
      enumerable: true,
      get() {
        return ref.value
      },
      set(next: number) {
        ref.value = next
      },
    })

    return () => clearInterval(handle)
  })
}
