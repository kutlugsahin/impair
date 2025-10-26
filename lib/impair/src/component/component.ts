import { effect, ReactiveEffectRunner, stop } from '@vue/reactivity'
import { createElement, FC, memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { disposeContainer } from '../container/dispose'
import { Context } from '../context/context'
import { ServiceProvider } from '../provider/serviceProvider'
import { Constructor, Registrations, RendererViewModel } from '../types'
import { debounceMicrotask } from '../utils/debounceMicrotask'
import { setCurrentComponentContainerRef, setCurrentComponentPropsRef } from './current-component'
import { useViewModel } from './hooks/useViewModel'

function useForceUpdate() {
  const [_, setVal] = useState({})

  return useCallback(() => {
    setVal({})
  }, [])
}

export function component<P extends object>(component: FC<P>) {
  const Comp = memo((props: P) => {
    const forceUpdate = useForceUpdate()
    const renderResult = useRef<ReturnType<typeof component>>(null)
    const runner = useRef<ReactiveEffectRunner | undefined>(undefined)
    const propsRef = useRef<P>(props)
    const isDirty = useRef(false)
    const componentContainer = useRef<DependencyContainer | undefined>(undefined)

    propsRef.current = props
    isDirty.current = false

    if (!runner.current) {
      const render = debounceMicrotask(() => {
        if (isDirty.current) {
          forceUpdate()
        }
      })

      runner.current = effect(
        () => {
          setCurrentComponentContainerRef(componentContainer)
          setCurrentComponentPropsRef(propsRef)
          renderResult.current = component(propsRef.current)
          setCurrentComponentContainerRef(undefined)
          setCurrentComponentPropsRef(undefined)
        },
        {
          scheduler() {
            isDirty.current = true
            render()
          },
        },
      )
    } else {
      runner.current?.()
    }

    useEffect(() => {
      forceUpdate()

      return () => {
        if (runner.current) {
          stop(runner.current)
        }
        runner.current = undefined

        if (componentContainer.current) {
          disposeContainer(componentContainer.current)
          componentContainer.current = undefined
        }
      }
    }, [forceUpdate])

    if (componentContainer.current) {
      return createElement(
        Context.Provider,
        { value: componentContainer.current },
        renderResult.current as ReactElement,
      )
    }

    return renderResult.current
  }) as unknown as FC<P> & { provide: (...args: Registrations) => FC<P> }

  Comp.provide = (...services: Registrations) => {
    const ComponentWithServices: FC<P> = (props: P) => {
      return createElement(ServiceProvider, { provide: services }, createElement(Comp, props))
    }

    ComponentWithServices.displayName = `(ImpairServiceProvider) ${Comp.displayName || Comp.name || 'Component'}`

    return ComponentWithServices
  }

  Comp.displayName = component.displayName || component.name || 'Component'

  return Comp
}

component.fromViewModel = <P extends object>(viewModel: Constructor<RendererViewModel>) => {
  const comp = component<P>(() => useViewModel(viewModel).render())
  comp.displayName = `(ImpairViewModel) ${viewModel.name.replace('ViewModel', '')}`
  return comp
}
