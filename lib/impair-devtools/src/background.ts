type Port = chrome.runtime.Port

const panelPorts = new Map<number, Port>()

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'impair-devtools-panel') return

  let tabId: number | undefined

  port.onMessage.addListener((message) => {
    // First message from panel carries the tabId
    if (message.tabId != null && tabId == null) {
      tabId = message.tabId as number
      panelPorts.set(tabId, port)
      return
    }

    // Forward panel commands to content script
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, {
        source: 'impair-devtools-background',
        command: message.command,
        args: message.args,
        requestId: message.requestId,
      })
    }
  })

  port.onDisconnect.addListener(() => {
    if (tabId != null) {
      panelPorts.delete(tabId)
    }
  })
})

// Forward messages from content script to panel
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.source !== 'impair-devtools-content') return

  const tabId = sender.tab?.id
  if (tabId == null) return

  const port = panelPorts.get(tabId)
  if (port) {
    port.postMessage(message)
  }
})
