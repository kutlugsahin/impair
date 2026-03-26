import { DependencyContainer } from 'tsyringe'
import { stateMetadataKey, derivedMetadataKey, devtoolsContainerId } from '../utils/symbols'
import type { StateMetadata } from '../reactivity/state'

type ContainerNode = {
  id: string
  container: DependencyContainer
  parentId: string | null
  instances: Map<string, any>
}

type EventCallback = (...args: any[]) => void

let idCounter = 0

const containers = new Map<string, ContainerNode>()
const listeners = new Map<string, Set<EventCallback>>()

function generateId(): string {
  return `impair-dt-${idCounter++}`
}

function getTokenName(token: any): string {
  if (typeof token === 'function') return token.name || 'Anonymous'
  if (typeof token === 'symbol') return token.description || token.toString()
  return String(token)
}

function on(event: string, cb: EventCallback) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(cb)
  return () => listeners.get(event)?.delete(cb)
}

function emit(event: string, data?: any) {
  listeners.get(event)?.forEach((cb) => cb(data))
  // Also push to content script via postMessage
  if (typeof window !== 'undefined') {
    try {
      window.postMessage(
        { source: 'impair-devtools-hook', event, data: serializeForTransport(data) },
        '*',
      )
    } catch {
      // serialization may fail for complex objects, ignore
    }
  }
}

function serializeForTransport(value: any, seen = new WeakSet()): any {
  if (value === null || value === undefined) return value
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`
  if (typeof value === 'symbol') return value.description || value.toString()
  if (typeof value !== 'object') return value

  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((v) => serializeForTransport(v, seen))
  }

  if (value instanceof Map) {
    const obj: Record<string, any> = {}
    value.forEach((v, k) => {
      obj[String(k)] = serializeForTransport(v, seen)
    })
    return { __type: 'Map', entries: obj }
  }

  if (value instanceof Set) {
    return { __type: 'Set', values: [...value].slice(0, 100).map((v) => serializeForTransport(v, seen)) }
  }

  const result: Record<string, any> = {}
  const keys = Object.keys(value)
  for (const key of keys.slice(0, 50)) {
    try {
      result[key] = serializeForTransport(value[key], seen)
    } catch {
      result[key] = '[Unserializable]'
    }
  }
  return result
}

function registerContainer(container: DependencyContainer, parent?: DependencyContainer) {
  const id = generateId()
  let parentId: string | null = null

  if (parent) {
    containers.forEach((node) => {
      if (node.container === parent) parentId = node.id
    })
  }

  ;(container as any)[devtoolsContainerId] = id

  containers.set(id, {
    id,
    container,
    parentId,
    instances: new Map(),
  })

  emit('container-registered', { id, parentId })
}

function unregisterContainer(container: DependencyContainer) {
  const id = (container as any)[devtoolsContainerId]
  if (!id) return

  // Unregister children first
  containers.forEach((node) => {
    if (node.parentId === id) {
      unregisterContainer(node.container)
    }
  })

  containers.delete(id)
  emit('container-unregistered', { id })
}

function registerInstance(container: DependencyContainer, token: any, instance: any) {
  const id = (container as any)[devtoolsContainerId]
  if (!id) return

  const node = containers.get(id)
  if (!node) return

  const tokenName = getTokenName(token)
  node.instances.set(tokenName, instance)

  emit('instance-registered', { containerId: id, tokenName })
}

function getTree(): any {
  const nodes: any[] = []

  containers.forEach((node) => {
    const serviceNames: string[] = []
    node.instances.forEach((_, name) => serviceNames.push(name))

    nodes.push({
      id: node.id,
      parentId: node.parentId,
      services: serviceNames,
    })
  })

  return nodes
}

function getContainerDetails(id: string) {
  const node = containers.get(id)
  if (!node) return null

  const services: { tokenName: string }[] = []
  node.instances.forEach((_, tokenName) => {
    services.push({ tokenName })
  })

  return { id, services }
}

function getInstanceState(containerId: string, tokenName: string) {
  const node = containers.get(containerId)
  if (!node) return null

  const instance = node.instances.get(tokenName)
  if (!instance) return null

  const result: { state: Record<string, any>; derived: Record<string, any> } = {
    state: {},
    derived: {},
  }

  // Read @state properties
  const stateMetadata: StateMetadata[] | undefined = Reflect.getMetadata(stateMetadataKey, instance)
  if (stateMetadata) {
    const seen = new Set<string>()
    stateMetadata.forEach(({ propertyKey }) => {
      if (!seen.has(propertyKey)) {
        seen.add(propertyKey)
        try {
          result.state[propertyKey] = serializeForTransport(instance[propertyKey])
        } catch {
          result.state[propertyKey] = '[Unreadable]'
        }
      }
    })
  }

  // Read @derived properties
  const derivedMetadata: { propertyKey: string }[] | undefined = Reflect.getMetadata(
    derivedMetadataKey,
    instance,
  )
  if (derivedMetadata) {
    const seen = new Set<string>()
    derivedMetadata.forEach(({ propertyKey }) => {
      if (!seen.has(propertyKey)) {
        seen.add(propertyKey)
        try {
          result.derived[propertyKey] = serializeForTransport(instance[propertyKey])
        } catch {
          result.derived[propertyKey] = '[Unreadable]'
        }
      }
    })
  }

  return result
}

function setStateValue(containerId: string, tokenName: string, key: string, value: any) {
  const node = containers.get(containerId)
  if (!node) return false

  const instance = node.instances.get(tokenName)
  if (!instance) return false

  try {
    instance[key] = value
    emit('state-changed', { containerId, tokenName, key, value: serializeForTransport(value) })
    return true
  } catch {
    return false
  }
}

function handleMessage(event: MessageEvent) {
  if (event.data?.source !== 'impair-devtools-content') return

  const { command, args, requestId } = event.data

  let result: any

  switch (command) {
    case 'getTree':
      result = getTree()
      break
    case 'getContainerDetails':
      result = getContainerDetails(args.id)
      break
    case 'getInstanceState':
      result = getInstanceState(args.containerId, args.tokenName)
      break
    case 'setStateValue':
      result = setStateValue(args.containerId, args.tokenName, args.key, args.value)
      break
  }

  window.postMessage(
    { source: 'impair-devtools-hook', event: 'response', command, result, requestId },
    '*',
  )
}

export function installHook() {
  if (typeof window === 'undefined') return
  if ((window as any).__IMPAIR_DEVTOOLS_HOOK__) return

  window.addEventListener('message', handleMessage)

  const hook = {
    registerContainer,
    unregisterContainer,
    registerInstance,
    getTree,
    getContainerDetails,
    getInstanceState,
    setStateValue,
    on,
    emit,
  }

  ;(window as any).__IMPAIR_DEVTOOLS_HOOK__ = hook

  return hook
}

export function getDevtoolsHook() {
  if (typeof window === 'undefined') return null
  return (window as any).__IMPAIR_DEVTOOLS_HOOK__ as ReturnType<typeof installHook> | null
}
