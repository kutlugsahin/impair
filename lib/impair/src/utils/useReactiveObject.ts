import { shallowReactive, shallowReadonly } from '@vue/reactivity'
import { useMemo } from 'react'
import { isPlainObject } from './object'
import { updateObjectProps } from './updateObjectProps'

/**
 * A hook that creates a shallow reactive object from source object and updates it when object properties changes.
 * @returns A referentially stable shallow reactive object that reflects the current state of the props.
 */
export function useReactiveObject<P extends object>(obj?: P) {
  const { state, next } = useMemo(() => {
    if (obj && !isPlainObject(obj)) {
      throw new Error('[useReactiveObject] props must be a plain js object')
    }

    // Use a mutable state internally
    const state = obj ? shallowReactive<P>({ ...obj }) : undefined

    const next = (nextProps: P) => {
      if (!state) {
        throw new Error('[useReactiveObject] argument was previously undefined')
      }

      updateObjectProps(state, nextProps)
    }

    return {
      // Expose a readonly version to the consumer
      state: state ? shallowReadonly(state) : undefined,
      next,
    }
  }, []) // Empty dependency array ensures this runs only once

  if (obj) {
    next(obj)
  }

  // Return the readonly reactive props
  return state
}
