import type { CSSProperties } from 'react'

import { component, useViewModel } from 'impair'

import { FilterViewModel, PRESETS } from './filter-view-model'

export const FilterList = component(function FilterList() {
  const {
    query,
    minPrice,
    maxPrice,
    results,
    runs,
    setQuery,
    setMinPrice,
    setMaxPrice,
    applyPreset,
  } = useViewModel(FilterViewModel)

  return (
    <div>
      <p style={{ opacity: 0.7, fontSize: 13, marginTop: 0 }}>
        <code>recompute</code> runs: <strong>{runs}</strong>
      </p>

      <div style={grid}>
        <label>
          <span style={lbl}>name contains</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} style={input} />
        </label>
        <label>
          <span style={lbl}>min price</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            style={input}
          />
        </label>
        <label>
          <span style={lbl}>max price</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={input}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{ alignSelf: 'center', fontSize: 13, opacity: 0.7 }}>presets (each mutates 3 fields at once):</span>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <ul>
        {results.map((p) => (
          <li key={p.id}>
            {p.name} — ${p.price}
          </li>
        ))}
        {results.length === 0 && <li style={{ opacity: 0.6 }}>no matches</li>}
      </ul>
    </div>
  )
})

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 8,
  marginBottom: 12,
}
const lbl: CSSProperties = { display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 2 }
const input: CSSProperties = { width: '100%', padding: 6, boxSizing: 'border-box', fontSize: 14 }
