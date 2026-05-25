import 'reflect-metadata'

import { useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { configure } from 'impair'

import './styles.css'

import { Counter } from './01-counter/counter'
import { TodoList } from './02-service-injection/todo-list'
import { UserView } from './03-viewmodel-props/user-view'
import { Cart } from './04-derived/cart'
import { LifecycleDemo } from './05-lifecycle/lifecycle-demo'
import { FilterList } from './06-async-trigger/filter-list'
import { Editors } from './07-provide-decorator/editor'
import { Clock } from './08-from-view-model/clock-view-model'
import { HierarchicalApp } from './09-hierarchical-containers/app'
import { Tick } from './10-custom-decorator/tick'
import { LevelDemo } from './11-reactivity-levels/level-demo'
import { LoginForm } from './12-use-resolve/login-form'
import { CircularDemo } from './13-circular-deps/circular-demo'
import { PluginDemo } from './14-container-token/plugin-demo'
import { AutoSave } from './15-untrack/auto-save'
import { SliderDemo } from './16-debounce-throttle/slider-demo'

configure({
  defaultStateReactiveLevel: 'deep',
  readonlyProxiesForView: true,
})

type Example = {
  id: string
  label: string
  render: () => ReactNode
}

const examples: Example[] = [
  { id: '01-counter', label: '01 — Counter', render: () => <Counter /> },
  { id: '02-service-injection', label: '02 — Service Injection', render: () => <TodoList /> },
  { id: '03-viewmodel-props', label: '03 — ViewModel + Props', render: () => <UserView /> },
  { id: '04-derived', label: '04 — Derived state', render: () => <Cart /> },
  { id: '05-lifecycle', label: '05 — Lifecycle', render: () => <LifecycleDemo /> },
  { id: '06-async-trigger', label: '06 — Triggers (sync vs async)', render: () => <FilterList /> },
  { id: '07-provide-decorator', label: '07 — @provide', render: () => <Editors /> },
  { id: '08-from-view-model', label: '08 — fromViewModel', render: () => <Clock /> },
  { id: '09-hierarchical-containers', label: '09 — Hierarchical containers', render: () => <HierarchicalApp /> },
  { id: '10-custom-decorator', label: '10 — Custom decorator', render: () => <Tick /> },
  { id: '11-reactivity-levels', label: '11 — Reactivity levels', render: () => <LevelDemo /> },
  { id: '12-use-resolve', label: '12 — useResolve', render: () => <LoginForm /> },
  { id: '13-circular-deps', label: '13 — Circular deps (delay)', render: () => <CircularDemo /> },
  { id: '14-container-token', label: '14 — Container token', render: () => <PluginDemo /> },
  { id: '15-untrack', label: '15 — untrack in a trigger', render: () => <AutoSave /> },
  { id: '16-debounce-throttle', label: '16 — Trigger debounce/throttle', render: () => <SliderDemo /> },
]

function App() {
  const [selected, setSelected] = useState(() => location.hash.slice(1) || examples[0].id)
  const current = examples.find((e) => e.id === selected) ?? examples[0]

  return (
    <div className="shell">
      <aside>
        <h1>impair examples</h1>
        <nav>
          {examples.map((e) => (
            <button
              key={e.id}
              className={e.id === current.id ? 'active' : ''}
              onClick={() => {
                setSelected(e.id)
                location.hash = e.id
              }}
            >
              {e.label}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <h2>{current.label}</h2>
        {current.render()}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
