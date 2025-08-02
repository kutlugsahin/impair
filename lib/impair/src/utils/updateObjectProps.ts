export function updateObjectProps<P extends object>(target: P, source: P): void {
  const currentKeys = Object.keys(target) as Array<keyof P>
  const nextKeys = Object.keys(source) as Array<keyof P>

  // Update existing/new props
  for (const key of nextKeys) {
    if (target[key] !== source[key]) {
      target[key] = source[key]
    }
  }

  // Remove props that no longer exist
  for (const key of currentKeys) {
    if (!(key in source)) {
      delete target[key]
    }
  }
}
