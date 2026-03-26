// Detect Impair on the page and create the panel
function detect(callback: (detected: boolean) => void) {
  chrome.devtools.inspectedWindow.eval(
    'window.__IMPAIR_DEVTOOLS_HOOK__ != null',
    (result: boolean) => {
      callback(result)
    },
  )
}

let panelCreated = false

function tryCreatePanel() {
  if (panelCreated) return

  detect((detected) => {
    if (detected && !panelCreated) {
      panelCreated = true
      chrome.devtools.panels.create('Impair', '', 'panel/index.html')
    }
  })
}

// Check immediately and retry a few times (app may initialize after page load)
tryCreatePanel()
setTimeout(tryCreatePanel, 1000)
setTimeout(tryCreatePanel, 3000)
setTimeout(tryCreatePanel, 5000)
