// Relay: page (hook) <-> background (extension)

// Forward hook messages to background
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data?.source !== 'impair-devtools-hook') return

  chrome.runtime.sendMessage({
    source: 'impair-devtools-content',
    event: event.data.event,
    command: event.data.command,
    data: event.data.data,
    result: event.data.result,
    requestId: event.data.requestId,
  })
})

// Forward background commands to page (hook)
chrome.runtime.onMessage.addListener((message) => {
  if (message.source !== 'impair-devtools-background') return

  window.postMessage(
    {
      source: 'impair-devtools-content',
      command: message.command,
      args: message.args,
      requestId: message.requestId,
    },
    '*',
  )
})
