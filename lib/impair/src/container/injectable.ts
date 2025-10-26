import { injectable as tInjectable } from 'tsyringe'

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
