import { component, useViewModel } from 'impair'

import { EditorViewModel } from './editor-view-model'

const Editor = component(function Editor() {
  const { text, history, setText, undo, redo } = useViewModel(EditorViewModel)

  return (
    <div style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
      <p style={{ opacity: 0.7, fontSize: 12, margin: '0 0 8px' }}>
        history #{history.id} · undo stack: {history.past.length}
      </p>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={undo} disabled={history.past.length === 0}>
          Undo
        </button>{' '}
        <button onClick={redo} disabled={history.future.length === 0}>
          Redo
        </button>
      </div>
    </div>
  )
})

export function Editors() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Editor />
      <Editor />
    </div>
  )
}
