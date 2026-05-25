import { component, ServiceProvider, useService } from 'impair'

import { TodoApi, TodoService } from './services'

const TodoListView = component(function TodoListView() {
  const { todos, isLoading, load, clear } = useService(TodoService)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={load} disabled={isLoading}>
          {isLoading ? 'Loading…' : 'Load todos'}
        </button>{' '}
        <button onClick={clear} disabled={todos.length === 0}>
          Clear
        </button>
      </div>
      <ul>
        {todos.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )
})

export function TodoList() {
  return (
    <ServiceProvider provide={[TodoApi, TodoService]}>
      <TodoListView />
    </ServiceProvider>
  )
}
