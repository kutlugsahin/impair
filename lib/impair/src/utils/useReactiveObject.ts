import { shallowReactive, shallowReadonly } from '@vue/reactivity'
import { useEffect, useMemo } from 'react'
import { isPlainObject } from './object'

/**
 * A hook that creates a shallow reactive object from source object and updates it when object properties changes.
 * @returns A referentially stable shallow reactive object that reflects the current state of the props.
 */
export function useReactiveObject<P extends object>(obj: P) {
  const { state, next } = useMemo(() => {
    if (!isPlainObject(obj)) {
      throw new Error('[useReactiveObject] props must be a plain js object')
    }

    // Use a mutable state internally
    const state = shallowReactive<P>({ ...obj })

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
    next(obj)
  }, [obj, next]) // Rerun effect if props or the stable next function changes

  // Return the readonly reactive props
  return state
}
