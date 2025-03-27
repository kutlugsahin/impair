import { ReactiveEffectOptions, ReactiveEffectRunner, effect as coreEffect } from '@vue/reactivity'
import { debounceMicrotask } from '../utils/debounceMicrotask'
import { EffectCallback } from '../types'

export function effect(fn: EffectCallback, options?: ReactiveEffectOptions): ReactiveEffectRunner<void> {
  let cleanup: void | (() => void)

  return coreEffect(() => {
    if (cleanup) {
      cleanup()
    }

    cleanup = fn()
  }, options)
}

export function asyncEffect(fn: EffectCallback): ReactiveEffectRunner<void> {
  const callRunner = debounceMicrotask(() => {
    runner()
  })

  const runner = effect(fn, {
    scheduler() {
      callRunner()
    },
  })

  return runner
}
