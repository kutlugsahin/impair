import { describe, it, expect, afterEach } from 'vitest'
import { container } from 'tsyringe'
import { injectable, inject, ServiceProvider, useService } from '../index'
import { render } from '@testing-library/react'
import { createElement } from 'react'
import { createChildContainer } from './createChildContainer'
import { findRegisteredParentContainer } from '../utils/container'

describe('findRegisteredParentContainer — root-container resolution (regression)', () => {
  afterEach(() => {
    container.reset()
  })

  it('walks all the way to the tsyringe root and finds the token there', () => {
    const TOKEN = Symbol('test:root-token')

    @injectable()
    class RootSingleton {}

    // Register only on the tsyringe root — the pattern used in setup-vitest.ts
    // for cross-slice singletons shared across all test child containers.
    container.registerSingleton(TOKEN, RootSingleton)

    // Simulate the impair container hierarchy:
    //   tsyringe root → globalContainer → ServiceProvider child
    // Both child containers are created via createChildContainer so they
    // have the impair parent chain wired up.
    const globalContainer = createChildContainer(container)
    const serviceProviderContainer = createChildContainer(globalContainer)

    const found = findRegisteredParentContainer(serviceProviderContainer, TOKEN)

    expect(found, 'token registered on tsyringe root must be found via parent-chain walk').toBe(container)
  })

  it('resolves a token registered ONLY on the tsyringe root container from a nested ServiceProvider', () => {
    const TOKEN = Symbol('test:cross-slice-singleton')

    @injectable()
    class CrossSliceSingleton {}

    @injectable()
    class Consumer {
      constructor(@inject(TOKEN) public dep: CrossSliceSingleton) {}
    }

    container.registerSingleton(TOKEN, CrossSliceSingleton)

    let resolved: Consumer | undefined

    function Probe() {
      resolved = useService(Consumer)
      return null
    }

    render(
      createElement(
        ServiceProvider,
        { provide: [[Consumer, Consumer]] as any },
        createElement(Probe),
      ),
    )

    expect(resolved).toBeDefined()
    expect(resolved!.dep).toBeInstanceOf(CrossSliceSingleton)
  })
})
