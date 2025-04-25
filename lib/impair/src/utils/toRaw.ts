import { isProxy, toRaw as coreToRaw } from '@vue/reactivity'

export function toRaw<T>(value: T): T {
  if (isProxy(value)) {
    return coreToRaw(value)
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(toRaw) as unknown as T
    } else if (Object.getPrototypeOf(value) === Object.prototype) {
      const rawValue: Record<string, unknown> = {}
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          rawValue[key] = toRaw((value as Record<string, unknown>)[key])
        }
      }
      return rawValue as T
    } else if (value instanceof Map) {
      const rawValue = new Map()
      value.forEach((v, k) => {
        rawValue.set(k, toRaw(v))
      })
      return rawValue as T
    } else if (value instanceof Set) {
      const rawValue = new Set()
      value.forEach((v) => {
        rawValue.add(toRaw(v))
      })
      return rawValue as T
    }
  }

  return value
}
