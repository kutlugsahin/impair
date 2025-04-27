import { shallowReactive, shallowReadonly } from '@vue/reactivity'
import { useEffect, useMemo } from 'react'
import { isPlainObject } from './object'

export function useReactiveProps<P extends object>(props: P) {
  const { state, next } = useMemo(() => {
    if (!isPlainObject(props)) {
      throw new Error('[useReactiveProps] props must be a plain js object')
    }

    // Use a mutable state internally
    const state = shallowReactive<P>({ ...props })

    const next = (nextProps: P) => {
      const currentKeys = Object.keys(state) as Array<keyof P>
      const nextKeys = Object.keys(nextProps) as Array<keyof P>

      // Update existing/new props
      for (const key of nextKeys) {
        if (state[key] !== nextProps[key]) {
          state[key] = nextProps[key]
        }
      }

      // Remove props that no longer exist
      for (const key of currentKeys) {
        if (!(key in nextProps)) {
          delete state[key]
        }
      }
    }

    return {
      // Expose a readonly version to the consumer
      state: shallowReadonly(state),
      next,
    }
  }, []) // Empty dependency array ensures this runs only once

  useEffect(() => {
    // Update the reactive state when props change
    next(props)
  }, [props, next]) // Rerun effect if props or the stable next function changes

  // Return the readonly reactive props
  return state
}
