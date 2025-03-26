export const isMounted = Symbol('isServiceMounted')
export const isLifecycleHandled = Symbol('isLifecycleHandled')
export const isInitialized = Symbol('isInitialized')

export const stateMetadataKey = Symbol('state')
export const triggerMetadataKey = Symbol('trigger')
export const derivedMetadataKey = Symbol('derived')
export const injectableMetadataKey = Symbol('injectable')
export const provideMetadataKey = Symbol('provide')

export const onMountMetadataKey = Symbol('onMount')
export const onUnmountMetadataKey = Symbol('onUnmount')

export const onInitMetadataKey = Symbol('onInit')
export const onDestroyMetadataKey = Symbol('onDestroy')

export const isContainerDisposed = Symbol('isContainerDisposed')
