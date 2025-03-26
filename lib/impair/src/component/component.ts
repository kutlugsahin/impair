import { effect, ReactiveEffectRunner, stop } from '@vue/reactivity'
import { createElement, FC, memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { disposeContainer } from '../container/dispose'
import { Context } from '../context/context'
import { Constructor, RendererViewModel } from '../types'
import { setCurrentComponentContainerRef, useViewModel } from './hooks/useViewModel'
import { debounceMicrotask } from '../utils/debounceMicrotask'

function useForceUpdate() {
  const [_, setVal] = useState({})

  return useCallback(() => {
    setVal({})
  }, [])
}

export function component<P>(component: FC<P>) {
  return memo((props: P) => {
    const forceUpdate = useForceUpdate()
    const renderResult = useRef<ReturnType<typeof component>>(null)
    const runner = useRef<ReactiveEffectRunner>(null)
    const propsRef = useRef<P>(props)
    const isDirty = useRef(false)
    const componentContainer = useRef<DependencyContainer>(null)

    if (!runner.current) {
      const render = debounceMicrotask(() => {
        if (isDirty.current) {
          forceUpdate()
        }
      })

      runner.current = effect(
        () => {
          setCurrentComponentContainerRef(componentContainer)
          renderResult.current = component(propsRef.current)
        },
        {
          scheduler() {
            isDirty.current = true
            render()
          },
        }
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
    }, [])

    if (componentContainer.current) {
      return createElement(
        Context.Provider,
        { value: componentContainer.current },
        renderResult.current as ReactElement
      )
    }

    return renderResult.current
  }) as FC<P>
}

component.fromViewModel = <P extends object>(viewModel: Constructor<RendererViewModel>) => {
  const comp = component<P>((props) => useViewModel(viewModel, props).render())
  comp.displayName = viewModel.name.replace('ViewModel', '')
  return comp
}
