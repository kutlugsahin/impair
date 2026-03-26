export type MessageSource =
  | 'impair-devtools-hook'
  | 'impair-devtools-content'
  | 'impair-devtools-panel'
  | 'impair-devtools-background'

export type HookEvent =
  | 'container-registered'
  | 'container-unregistered'
  | 'instance-registered'
  | 'state-changed'
  | 'response'

export type PanelCommand =
  | 'getTree'
  | 'getContainerDetails'
  | 'getInstanceState'
  | 'setStateValue'

export type Message = {
  source: MessageSource
  event?: HookEvent
  command?: PanelCommand
  data?: any
  args?: any
  result?: any
  tabId?: number
}
