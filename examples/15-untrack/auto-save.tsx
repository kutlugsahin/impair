import { component, useViewModel } from 'impair'

import { AutoSaveViewModel } from './auto-save-view-model'

export const AutoSave = component(function AutoSave() {
  const { draft, author, saves, setDraft, setAuthor } = useViewModel(AutoSaveViewModel)

  return (
    <div>
      <label style={label}>
        author (changing this alone does NOT trigger a save):
        <input value={author} onChange={(e) => setAuthor(e.target.value)} style={input} />
      </label>

      <label style={label}>
        draft (every change kicks off an autosave):
        <textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} style={textarea} />
      </label>

      <h4 style={{ marginBottom: 4 }}>Save log ({saves.length})</h4>
      {saves.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No saves yet — edit the draft.</p>
      ) : (
        <ul style={{ paddingLeft: 16, fontFamily: 'monospace', fontSize: 13 }}>
          {saves.map((s, i) => (
            <li key={i}>
              <strong>{s.at}</strong> · by {s.by} · "{s.preview}"
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

const label = { display: 'block', marginBottom: 12 }
const input = { display: 'block', width: '100%', padding: 6, marginTop: 4, boxSizing: 'border-box' as const }
const textarea = { ...input, fontFamily: 'inherit' }
