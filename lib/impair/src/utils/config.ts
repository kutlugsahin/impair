import { StateType } from '../reactivity'

export type Configuration = {
  readonlyProxiesForView: boolean
  defaultStateReactiveLevel: Exclude<StateType, 'default'>
}

export const config: Configuration = {
  /**
   * @description: useViewModel and useSErvice will return readonly/writable data
   */
  readonlyProxiesForView: true,
  /**
   * @description: The default reactive level for state properties.
   * @default 'deep'
   */
  defaultStateReactiveLevel: 'deep' as Exclude<StateType, 'default'>,
}

export function configure(options: Partial<Configuration>) {
  Object.assign(config, options)
}
