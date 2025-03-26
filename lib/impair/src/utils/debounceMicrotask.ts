export function debounceMicrotask(fn: () => void) {
  let called = false

  return () => {
    if (!called) {
      called = true
      queueMicrotask(() => {
        called = false
        fn()
      })
    }
  }
}
