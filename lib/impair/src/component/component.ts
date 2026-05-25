import { effect, ReactiveEffectRunner, stop } from '@vue/reactivity'
import { createElement, FC, memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { DependencyContainer } from 'tsyringe'

import { disposeContainer } from '../container/dispose'
import { Context } from '../context/context'
import { ServiceProvider } from '../provider/serviceProvider'
import { Constructor, ReactiveComponent, Registrations, RendererViewModel, ServicePropsType } from '../types'
import { debounceMicrotask } from '../utils/debounceMicrotask'
import { registerComponentForFastRefresh } from '../utils/fastRefresh'
import { setCurrentComponentContainerRef, setCurrentComponentPropsRef } from './current-component'
import { useViewModel } from './hooks/useViewModel'

function useForceUpdate() {
  const [_, setVal] = useState({})

  return useCallback(() => {
    setVal({})
  }, [])
}

export function component<P extends object>(component: FC<P>): ReactiveComponent<P> {
  const Comp = memo((props: P) => {
    const forceUpdate = useForceUpdate()
    const renderResult = useRef<ReturnType<typeof component>>(null)
    const runner = useRef<ReactiveEffectRunner | undefined>(undefined)
    const propsRef = useRef<P>(props)
    const isDirty = useRef(false)
    const componentContainer = useRef<DependencyContainer | undefined>(undefined)
    const isMounted = useRef(false)

    propsRef.current = props
    isDirty.current = false

    if (!runner.current) {
      const render = debounceMicrotask(() => {
        if (isDirty.current && isMounted.current) {
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
      isMounted.current = true
      forceUpdate()

      return () => {
        isMounted.current = false
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
  }) as unknown as ReactiveComponent<P>

  Comp.provide = (...services: Registrations) => {
    const ComponentWithServices: FC<P> = (props: P) => {
      return createElement(ServiceProvider, { provide: services }, createElement(Comp, props))
    }

    ComponentWithServices.displayName = `(ImpairServiceProvider) ${Comp.displayName || Comp.name || 'Component'}`

    registerComponentForFastRefresh(
      ComponentWithServices,
      ComponentWithServices,
      `${Comp.displayName || Comp.name || 'Component'}.provide`,
    )

    return ComponentWithServices
  }

  Comp.displayName = component.displayName || component.name || 'Component'

  registerComponentForFastRefresh(Comp, component)

  return Comp
}

function fromViewModel<T extends Constructor<RendererViewModel>>(viewModel: T): FC<ServicePropsType<T, object>>
function fromViewModel<P extends object>(viewModel: Constructor<RendererViewModel>): FC<P>
function fromViewModel(viewModel: Constructor<RendererViewModel>) {
  // Tag the inner FC with the ViewModel class name so Fast Refresh registers `comp` under
  // a stable id derived from the VM. Without this, the anonymous arrow falls through to a
  // counter-based id that drifts across HMR updates and prevents state preservation.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renderFn: FC<object> = () => useViewModel(viewModel).render()
  renderFn.displayName = viewModel.name
  const comp = component(renderFn)
  comp.displayName = `(ImpairViewModel) ${viewModel.name.replace('ViewModel', '')}`
  return comp
}

component.fromViewModel = fromViewModel
