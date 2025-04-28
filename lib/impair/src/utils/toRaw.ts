import { isProxy, toRaw as coreToRaw } from '@vue/reactivity'

export function toRaw<T>(value: T): T {
  if (isProxy(value)) {
    return coreToRaw(value)
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        value[i] = toRaw(v)
      })
    } else if (Object.getPrototypeOf(value) === Object.prototype) {
      for (const key in value) {
        value[key] = toRaw(value[key])
      }
    } else if (value instanceof Map) {
      value.forEach((v, k) => {
        value.set(k, toRaw(v))
      })
    } else if (value instanceof Set) {
      const newSet = [...value].map(toRaw)

      value.clear()
      newSet.forEach((v) => {
        value.add(v)
      })
    }
  }

  return value
}
