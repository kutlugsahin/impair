import { ReactiveEffectRunner, effect as coreEffect } from '@vue/reactivity'
import { debounceMicrotask } from '../utils/debounceMicrotask'

export const effect = coreEffect

export function asyncEffect(fn: () => void): ReactiveEffectRunner<void> {
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
