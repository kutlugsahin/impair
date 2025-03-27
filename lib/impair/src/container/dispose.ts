import { isContainerDisposed } from '../utils/symbols'
import { DependencyContainer } from 'tsyringe'

export function disposeContainer(container: DependencyContainer) {
  if (!(container as any)[isContainerDisposed]) {
    ;(container as any)[isContainerDisposed] = true
    container.dispose()
  }
}
