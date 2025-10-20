import { injectable as tInjectable } from 'tsyringe'

import { globalContainer } from '../context/context'
import { Constructor } from '../types'
import { injectableMetadataKey } from '../utils/symbols'

export function injectable<T extends Constructor>() {
  return function (target: T) {
    tInjectable()(target)

    if (!target.prototype.dispose) {
      Object.defineProperty(target.prototype, 'dispose', {
        value: function dispose() {},
        writable: true,
        configurable: true,
      })
    }

    Reflect.metadata(injectableMetadataKey, true)(target)
  }
}

injectable.global = <T extends Constructor>() => {
  return function (target: T) {
    injectable()(target)
    Reflect.metadata(injectableMetadataKey, 'global')(target)
    globalContainer.registerSingleton(target)
  }
}
