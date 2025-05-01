import { enableTracking, pauseTracking } from '@vue/reactivity'

/**
 * Disables dependency tracking within the provided function's execution context.
 * Reactive properties accessed inside the function will not be tracked as dependencies,
 * meaning changes to them will not trigger reactive updates for the current effect scope.
 * This can be useful in triggers, derived computations, or component renders where
 * you want to access reactive data without establishing a dependency.
 * ```ts
 * \@state firstName = 'John'
 * \@state lastName = 'Doe'
 *
 * \@trigger
 * public logFullName() {
 *   const fullName = this.firstName + untrack(() => this.lastName);
 *   console.log(fullName); // Will log only when firstName changes
 * });
 * ```
 */
export function untrack<T extends () => any>(fn: T): ReturnType<T> {
  pauseTracking()
  try {
    const result = fn()
    return result
  } finally {
    enableTracking()
  }
}
