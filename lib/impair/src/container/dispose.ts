import { isContainerDisposed } from '../utils/symbols'
import { DependencyContainer } from 'tsyringe'

export function disposeContainer(container: DependencyContainer) {
  if (!container[isContainerDisposed]) {
    container[isContainerDisposed] = true
    container.dispose()
  }
}
