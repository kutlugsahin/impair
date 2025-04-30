import { StateType } from '../reactivity'

export const config = {
  /**
   * @description: useViewModel and useSErvice will return readonly/writable data
   */
  readonlyProxiesForView: true,
  /**
   * @description: The default reactive level for state properties.
   * @default 'deep'
   */
  defaultStateReactiveLevel: 'deep' as StateType,
}

export function configure(options: Partial<typeof config>) {
  Object.assign(config, options)
}
