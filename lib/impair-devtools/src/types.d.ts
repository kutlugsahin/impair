// Minimal Chrome extension API type declarations
declare namespace chrome {
  namespace runtime {
    interface Port {
      name: string
      sender?: runtime.MessageSender
      onMessage: Event<(message: any, port: Port) => void>
      onDisconnect: Event<(port: Port) => void>
      postMessage(message: any): void
      disconnect(): void
    }

    interface MessageSender {
      tab?: tabs.Tab
      frameId?: number
      id?: string
      url?: string
    }

    interface Event<T> {
      addListener(callback: T): void
      removeListener(callback: T): void
    }

    function connect(connectInfo?: { name?: string }): Port
    function sendMessage(message: any, responseCallback?: (response: any) => void): void

    const onConnect: Event<(port: Port) => void>
    const onMessage: Event<(message: any, sender: MessageSender, sendResponse: (response?: any) => void) => void>
  }

  namespace tabs {
    interface Tab {
      id?: number
      url?: string
    }

    function sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void
  }

  namespace devtools {
    namespace inspectedWindow {
      const tabId: number
      function eval(expression: string, callback?: (result: any, exceptionInfo?: any) => void): void
    }

    namespace panels {
      function create(title: string, iconPath: string, pagePath: string, callback?: (panel: any) => void): void
    }
  }
}
