import type { InjectionToken } from 'tsyringe'

const providerPropsSymbol = Symbol('Props')
export const Props: InjectionToken = providerPropsSymbol
