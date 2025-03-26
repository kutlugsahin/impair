export function getAllPropertiesAndMethods<T>(obj: T) {
  const properties = new Set<string>()

  let currentObj = obj
  while (currentObj !== null && currentObj !== Object.prototype) {
    Object.getOwnPropertyNames(currentObj).forEach((prop) => {
      if (prop !== 'constructor') {
        properties.add(prop)
      }
    })
    currentObj = Object.getPrototypeOf(currentObj)
  }

  return [...properties]
}

function getAllMethods<T>(obj: T) {
  const properties = new Set<string>()

  let currentObj = obj
  while (currentObj !== null && currentObj !== Object.prototype) {
    Object.getOwnPropertyNames(currentObj).forEach((prop) => {
      if (prop !== 'constructor' && Object.getOwnPropertyDescriptor(currentObj, prop)?.value instanceof Function) {
        properties.add(prop)
      }
    })
    currentObj = Object.getPrototypeOf(currentObj)
  }

  return [...properties]
}

export function bindMethods<T extends object>(instance: T): T {
  getAllMethods(instance).forEach((key) => {
    ;(instance as any)[key] = (instance as any)[key].bind(instance)
  })

  return instance
}

export function patchClassInstanceMethod(instance: any, methodName: string, callback: () => void) {
  const originalMethod = instance[methodName]

  if (originalMethod) {
    Object.defineProperty(instance, methodName, {
      value: function (this: any) {
        originalMethod.call(instance)
        callback()
      },
      configurable: true,
      writable: true,
    })
  } else {
    Object.defineProperty(instance, methodName, {
      value: function () {
        callback()
      },
      configurable: true,
      writable: true,
    })
  }

  return instance
}
