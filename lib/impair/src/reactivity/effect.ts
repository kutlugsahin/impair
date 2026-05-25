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

/**
 * Trailing-only debounce: collapses a burst of dependency changes into a single run
 * `ms` milliseconds after the last change. The initial run (when the effect is created)
 * is immediate; only re-runs from subsequent dependency changes are debounced.
 */
export function debouncedEffect(fn: () => void, ms: number): ReactiveEffectRunner<void> {
  let handle: ReturnType<typeof setTimeout> | undefined

  const runner = effect(fn, {
    scheduler() {
      if (handle !== undefined) clearTimeout(handle)
      handle = setTimeout(() => {
        handle = undefined
        runner()
      }, ms)
    },
  })

  return runner
}

/**
 * Leading + trailing throttle: at most one run per `ms` milliseconds. Fires immediately
 * on the first dependency change of a window; if further changes happen during the
 * window, schedules one trailing run at window close. As above, the initial run is
 * immediate (it happens before any scheduler call).
 */
export function throttledEffect(fn: () => void, ms: number): ReactiveEffectRunner<void> {
  let inWindow = false
  let pending = false
  let handle: ReturnType<typeof setTimeout> | undefined

  const closeWindow = () => {
    handle = undefined
    inWindow = false
    if (pending) {
      pending = false
      openWindow()
      runner()
    }
  }

  const openWindow = () => {
    inWindow = true
    handle = setTimeout(closeWindow, ms)
  }

  const runner = effect(fn, {
    scheduler() {
      if (!inWindow) {
        openWindow()
        runner()
      } else {
        pending = true
      }
    },
  })

  return runner
}
