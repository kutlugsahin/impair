import { RefObject } from 'react'
import { DependencyContainer } from 'tsyringe'

let currentComponentPropsRef: RefObject<any> | undefined
let currentComponentContainerRef: RefObject<DependencyContainer | undefined> | undefined

export function setCurrentComponentContainerRef(containerRef: typeof currentComponentContainerRef) {
  currentComponentContainerRef = containerRef
}

export function setCurrentComponentPropsRef(propsRef: RefObject<any> | undefined) {
  currentComponentPropsRef = propsRef
}

export function getCurrentComponentContainerRef() {
  return currentComponentContainerRef
}

export function getCurrentComponentPropsRef() {
  return currentComponentPropsRef
}
