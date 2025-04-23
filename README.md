# impair

## Introduction

impair is a React framework bringing several programming concepts together in order to provide a foundation for a layered, scalable, performant and enterprise level react application.

## Philosophy

After working in many react applications over the years, this framework is my personal solution to the problems and limitations of a conventional react application and react mental model by enabling a layered application structure similar to MVVM and pushing react to actually be the View layer. By doing so, the logic of the application can be managed in the business layer via service classes whose instances are managed by a dependency container enabling a proper dependency injection mechanism in OOP style. The idea is that business layer contains and manages the application state and behavior distributed across the service classes while the view layer (react component) consumes the services. With this approach react components will be mostly stateless (pure) and decoupled from the data and **State** becomes just a field in a class.

You may ask yourself if the components can be stateless now and the state will reside in classes, how will the components render when some data changes in a class. In other words how does the reactivity work? To solve that challenge Impair introduces a simple and seemless way of defining reactive data via decorators keeping the type and shape of the reactive data as is, not converting it into another structure like signals or refs. Reactive values can only be defined as decorated service class fields and nowhere else. This design approach has two benefits. First it helps to keep things in order and easy to find when you need. And second, designing it as a class field makes it possible to preserve the object type as it.

Under the hoods reactive data is managed by a proxy based reactivity system which tracks mutations deeply so that you don’t need to maintain immutability and you can just mutate the parts of your data intuitively.

Using the magic of proxy reactivity, components using any reactive field in a service will get rendered only if the referenced data is actually updated. This leads to a dramatic performance improvement out of the box without any explicit performance optimizations. Additionally, after logic migrates to service layer, react components will remain mostly pure without hooks and every kind of drama related to it.

## Installation and configuration

```bash
npm install impair reflect-metadata
```

```json
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
  }
```

- Vite config with **plugin-react-swc**

```tsx
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
  ],
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
})
```

- vite config with **plugin-react**

```tsx
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['@babel/plugin-syntax-decorators', { legacy: true }]],
      },
    }
  ],
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  }
})
```

make sure reflect-metadata is imported at the top level

```tsx
import 'reflect-metadata'

import ReactDOM from 'react-dom/client'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

## Defining Service Layer

### ServiceProvider

Impair provides **ServiceProvider** component to define a service layer. Each **ServiceProvider** accepts a set of Service classes to be registered to the dependency container created by the ServiceProvider. Across the application code there can be many ServiceProvider components. Their dependency containers will be constructed hierarchically in parent child relation. For example if ServiceProviderA is a descendent of ServiceProviderB in the component tree, the container of ServiceProviderA will be the child container of ServiceProviderB. That means if some token resolved in A is not registered it will try to resolve it in the container B and it goes up like this.

```tsx
import { ServiceProvider } from 'impair'
import { TodoService } from './todo-service'
import { TodoList } from './todo-list'
import { TodoApi } from './todo-api'

export function TodoApp() {
  return (
    <ServiceProvider provide={[TodoService, TodoApi]}>
      <TodoList />
    </ServiceProvider>
  )
}
```

### Registration

Commonly service classes but actually any kind of provider can be registered to an injection token. ServiceProvider.provide property accepts several way of registration as an array.

- Class: a single class to be registered as singleton by default
- [Class, Lifecycle]: a single class to be registered as singleton by the given lifecycle ('singleton' | 'transient' | 'container' | 'resolution’)
- [token, Class]: token (string|Symbol|Class) will be resolved to a singleton class
- [token, Class, Lifecycle]: class will be resolved with given lifecycle
- Registration, an object to define the registration in details with token, provider and lifecycle properties.

```tsx
export function TodoApp() {
  return (
    <ServiceProvider
      provide={[
        [TodoService, 'singleton'],
        ['todoApi', TodoApi, 'transient'],
        {
          token: 'apiToken',
          provider: {
            useValue: 'Bearer ....',
          },
          lifecycle: 'singleton',
        },
      ]}
    >
      <TodoList />
    </ServiceProvider>
  )
}
```

### Service classes

Service classes are ordinary decorated classes (@injectable) to be resolved by the dependency container of the ServiceProvider and provided as a single instance to all descendent component in the view tree. Services can inject other services through the constructor parameter injection. Since the services are resolved in the ServiceProvider’s dependency container all services registered in the same container can inject each other as well as the services registered in some parent ServiceContainer.

### Dependency Injection

There are two decorators provided by Impair to decorate classes and constructor parameters to be resolved.

- @injectable() decorated the class to be a service to be resolved by dependency containers.
- @inject(token: string | Symbol | Class ): Parameter decorator which takes a token as argument

```tsx
import { injectable, inject } from 'impair'

@injectable()
export class TodoApi {
  public loadTodos() {
    return fetch('/todos').then((p) => p.json())
  }
}

@injectable()
export class TodoService {
  public todos: Todo[] = []

  constructor(@inject(TodoApi) private api: TodoApi) {}

  async loadTodos() {
    this.todos = await this.api.loadTodos()
  }
}
```

There may be cyclic resolution among services like this

```tsx
@injectable()
class ServiceA {
  constructor(@inject(ServiceB) serviceB: ServiceB) {}
}

@injectable()
class ServiceB {
  constructor(@inject(ServiceA) serviceA: ServiceA) {}
}
```

This would lead to infinite loop of constructing ServiceA and ServiceB. To avoid that inject decorator accepts DelayedConstuctor. When a delayed constructor is injected a proxy object is created and injected instead of the actual object.

- @inject(delay(() ⇒ Class))

```tsx
import { injectable, inject, delay } from 'impair'

@injectable()
class ServiceB {
  constructor(@inject(delay(() => ServiceA)) serviceB: ServiceA) {}
}
```

### Reactivity

So far we structured our data within services as class members and manipulate it throughout the service layer. But now we need a way to detect and react to those changes. This is especially needed for react components to get rendered when some changing data is referenced from a component. Connecting components to services will be explained later so lets focus how to declare reactive data and detect changes in the service layer.

- **@state**: Decorator to mark a class property as reactive (deeply reactive)

```tsx
import { state, inject, injectable } from 'impair'

@injectable()
export class TodoService {
  @state
  public todos: Todo[] = []

  constructor(@inject(TodoApi) private api: TodoApi) {}

  async loadTodos() {
    this.todos = await this.api.loadTodos()
  }
}
```

When a property is decorated with @state a proxy based reactive value is created and managed under the hood. So any mutation (deep or reference) is tracked and notified to the listeners

You can fine tune the level of reactivity as ‘atom’ | ‘shallow’ | ‘deep’ (deep is the default)

- **@state.atom**: reactive by reference. Deep mutations are not tracked
- **@state.shallow**: first level properties are tracked. This is meaningful for objects/arrays/maps/sets

- **@trigger**: Method decorator that runs the method as the ‘effect’ function. Trigger methods will be called automatically and synchronously whenever a referenced reactive value is updated.

```tsx
import { state, trigger, inject, injectable } from 'impair'

@injectable()
export class TodoService {
  @state
  public todos: Todo[] = []

  constructor(@inject(TodoApi) private api: TodoApi) {}

  async loadTodos() {
    this.todos = await this.api.loadTodos()
  }

  @trigger
  logTodoCount() {
    console.log(this.todos.length)
  }
}
```

By default triggers will run synchronously but you can make it run async too.

- @trigger.async: method will be triggered in the next tick debouncing frequent sync state changes.

- **@derived**: property getter decorator for aggregated reactive values

```tsx
import { state, trigger, inject, injectable } from 'impair'

@injectable()
export class TodoService {
  @state
  public todos: Todo[] = []

  @derived
  get completedTodos() {
    return this.todos.filter((p) => p.isDone)
  }
}
```

### Lifecycle

Thera are lifecycle decorators for services.

- @onMount: called when the ServiceProvider is mounted
- @onUnmount: called when the ServiceProvider is unmounted
- @onInit: called when the service class is initialized and all the decorators are initialized
- @onDispose: called when the parent dependency container is disposed

```tsx
import { onMount, onUnmount, onInit, onDispose } from 'impair'

@injectable()
export class TodoService {
  @state
  public todos: Todo[] = []

  constructor(@inject(TodoApi) private api: TodoApi) {}

  @onMount
  async loadTodos() {
    this.todos = await this.api.loadTodos()
  }
}
```

### Props (Injection Token)

Occasionally you may want to use data from outside the service layer. For that ServiceProvider component has a property named “props”. That object passed to props can be injected in the services with token called “Props”. The injected Props object has the same structure with the object passed to ‘props’ of ServiceProvider, but it is reactive. So you can listen the changes in trigger methods.

```tsx
function UserFeature() {
  const [userId, setUserId] = useState(0)

  return (
    <ServiceProvider provide={[UserService]} props={{ userId }}>
      <User />
    </ServiceProvider>
  )
}
```

```tsx
import { trigger, state, injectable, inject, Props } from 'impair'

type ServiceProps = {
  userId: number
}

@injectable()
export class UserService {
  @state
  public user: User

  constructor(@inject(Props) private props: ServiceProps) {}

  @trigger
  async loadUser() {
    this.user = await loadUser(this.props.userId)
  }
}
```

## Consuming Service Layer

### component(React.FC)

Higher order component that returns a memoized version of the given component. All components that need to consume services has to be wrapped with ‘component’. Resulting component is optimized out of the box getting rendered only if a referenced reactive value is changed

### useService(Class)

Hook to access the given service. Components can use many services.

```tsx
@injectable()
export class CounterService {
  @state
  count = 0

  inrement() {
    this.count++
  }
}
```

```tsx
import { component, useService } from 'impair'

export const Counter = component(() => {
  const { count, increment } = useService(CounterService)

  return <button onClick={increment}>Count is: {count}</button>
})
```

### useViewModel(Class, props?)

So far we have discussed the service layer, creating services shared across the components descendent to the ServiceProvider. But what if we want to create a service exclusive to a component which will be created when the component is mounted and destroyed when unmounted. useViewModel is there to achieve this behavior. Conceptually these kind of services are called view models. When a viewModel is used in a component, a dependency container is created for that component as the child of parent container and given viewModel is registered by default. ViewModels can inject services and Props (component props) as well. If you want to access the component props from viewModel you should pass props as the second parameter to useViewModel and then inject it using Props injection token.

```tsx
@injectable()
export class AutoCompleteViewModel {
  @state
  query = ''

  @state
  items: Item[] = []

  @state
  isLoading = false

  setQuery(query: string) {
    this.query = query
  }

  @trigger
  async loadResults() {
    this.isLoading = true
    this.items = await loadItems(this.query)
    this.isLoading = false
  }
}
```

```tsx
import { component, useViewModel } from 'impair'

type AutoCompleteProps = {
  someProp: string
}

const AutoComplete = component((props: AutoCompleteProps) => {
  const { query, setQuery, isLoading, items } = useViewModel(AutoCompleteViewModel, props)

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {items.map((item) => (
          <li>{item.name}</li>
        ))}
      </ul>
    </div>
  )
})
```
