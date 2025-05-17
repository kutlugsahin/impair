import { isProxy, toRaw as coreToRaw } from '@vue/reactivity'

export function toRaw<T>(value: T): T
export function toRaw<T>(value: T, deep: boolean): T
export function toRaw<T>(value: T, deep: boolean = true): T {
  if (isProxy(value) || !deep) {
    return coreToRaw(value)
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((v) => toRaw(v)) as T
    } else if (Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(Object.entries(value as object).map(([key, v]) => [key, toRaw(v)])) as T
    } else if (value instanceof Map) {
      return new Map(value.entries().map(([key, v]) => [key, toRaw(v)])) as T
    } else if (value instanceof Set) {
      return new Set([...value].map((v) => toRaw(v))) as T
    }
  }

  return value
}
