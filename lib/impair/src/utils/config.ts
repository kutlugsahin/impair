import { StateType } from '../reactivity'

export const config = {
  readonlyProxiesForView: true,
  defaultStateReactiveLevel: 'deep' as StateType,
}

export function configure(options: Partial<typeof config>) {
  Object.assign(config, options)
}
