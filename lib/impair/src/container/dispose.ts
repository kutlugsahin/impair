import { DependencyContainer } from 'tsyringe'
import { isContainerDisposed } from '../utils/symbols'

export function disposeContainer(container: DependencyContainer) {
  if (!(container as any)[isContainerDisposed]) {
    ;(container as any)[isContainerDisposed] = true
    container.dispose()
  }
}

export function isDisposed(container: DependencyContainer): boolean {
  return !!(container as any)[isContainerDisposed]
}
