# impair

## Introduction

impair is a React framework bringing several programming concepts together in order to provide a foundation for a layered, scalable, performant and enterprise level react application.

## Philosophy

After working in many react applications over the years, this framework is my personal solution to the problems and limitations of a conventional react application and react mental model by enabling a layered application structure similar to MVVM and pushing react to actually be the View layer. By doing so, the logic of the application can be managed in the business layer via service classes whose instances are managed by a dependency container enabling a proper dependency injection mechanism in OOP style. The idea is that business layer contains and manages the application state and behavior distributed across the service classes while the view layer (react component) consumes the services. With this approach react components will be mostly stateless (pure) and decoupled from the data and **State** becomes just a field in a class.

You may ask yourself if the components can be stateless now and the state will reside in classes, how will the components render when some data changes in a class. In other words how does the reactivity work? To solve that challenge Impair introduces a simple and seamless way of defining reactive data via decorators keeping the type and shape of the reactive data as is, not converting it into another structure like signals or refs. Under the hood reactive data is managed by a proxy based reactivity system which tracks mutations deeply so that you don’t need to care about immutable objects and you can just mutate the parts of your data intuitively.

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

**A )** Vite config with **plugin-react-swc**

```bash
npm i -D @vitejs/plugin-react-swc
```

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

**B )** Vite config with **plugin-react**

```bash
npm i @babel/plugin-syntax-decorators
```

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

Impair provides **ServiceProvider** component to define a service layer. Each **ServiceProvider** accepts a set of Service classes to be registered to the dependency container created by the ServiceProvider. Across the application code there can be many ServiceProvider components. Their dependency containers will be constructed hierarchically in parent child relation using context api under the hood. For example if ServiceProviderA is a descendent of ServiceProviderB in the component tree, the container of ServiceProviderA will be the child container of ServiceProviderB. That means if some token resolved in A is not registered it will try to resolve it in the container B and it goes up like this.

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

There are two decorators provided by Impair to decorate classes and constructor parameters in order to be managed by the dependency container.

- **@injectable()**: All the service classes have to be decorated with @injectable decorator
- **@inject(**token: string | Symbol | Class**)**: Constructor parameter decorator which takes a token as argument to be resolved by dependency container to construct the class instance.

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

This would lead to infinite loop of constructing ServiceA and ServiceB. To avoid that inject decorator accepts DelayedConstructor. When a delayed constructor is injected a proxy object is created and injected instead of the actual object.

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
- **@state.deep**: Objects are deeply reactive including arrays maps and sets.

When @state is used the default reactivity level is applied which is equal to @state.deep by default. You can change the default reactivity level globally using **configure** function.

- **@trigger**: Method decorator that runs the method as the ‘effect’ function. Trigger methods will be called automatically and synchronously whenever a referenced reactive value is updated. Trigger method accepts an optional cleanup function so that you can cleanup resources or cancel request etc.

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
  logTodoCount(cleanup: Cleanup) {
    const count = this.todos.length

    cleanup(() => {
      console.log(`Previous count was: ${count}`)
    })

    console.log(`Current count is: ${count}`)
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

### useService(Class | injectionToken)

Hook to access the given service. Components can use many services. The returned service’s reactive fields will be readonly by default (which can be configured globally using **configure function**) to prevent accidental mutations from the view layer.

```tsx
@injectable()
export class CounterService {
  @state
  count = 0

  increment() {
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

### useViewModel(Class)

So far we have discussed the service layer, creating services shared across the components descendent to the ServiceProvider. But what if we want to create a service exclusive to a component which will be created when the component is mounted and destroyed when unmounted. useViewModel is there to achieve this behavior. Conceptually these kind of services are called view models. When a viewModel is used in a component, a dependency container is created for that component as the child of parent container and given viewModel is registered by default. ViewModels can inject services and ViewProps (component props via ViewProps token) as well. A component can use many view models with multiple useViewModel. All the viewModels are registered in the same dependency container so that they can inject each other as well as the services from ancestor dependency containers.

### ViewProps (Injection Token)

If you want to access the component props from viewModel you should pass props as the second parameter to useViewModel and then inject it using ViewProps injection token. injected object will be shallow reactive.

```tsx
@injectable()
export class AutoCompleteViewModel {
  @state
  query = ''

  @state
  items: Item[] = []

  @state
  isLoading = false

  constructor(@inject(ViewProps) props: AutoCompleteProps) {}

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

### @provide(registrations: Registration[])

When component uses one or more view models a dependency container will be created exclusive to that component. If you want to register some services to that container you can add @provide(registrations: Registration[]) class decorator to the view model class. The parameter type has the same type of ServiceProvider’s provide property.

```tsx
@injectable()
@provide([[SearchApi, 'transient']])
export class AutoCompleteViewModel {
  constructor(@inject(SearchApi) private api: SearchApi) {}
}
```

### component.fromViewModel(viewModel: Class)

View models can be converted to components by implementing a render function in view model. It’s like a shorthand of declaring view model class and its component in one class. This may sound like a violation of separation of concerns but it is not. View models are actually belong to the view layer and view dependent logic is expected in the view models. Here is how it looks like.

```tsx
export type AutoCompleteProps = {
  someProp: string
}

@injectable()
class AutoCompleteViewModel {
  @state
  query = ''

  @state
  items: Item[] = []

  @state
  isLoading = false

  constructor(@inject(ViewProps) props: AutoCompleteProps) {}

  @trigger
  async loadResults() {
    this.isLoading = true
    this.items = await loadItems(this.query)
    this.isLoading = false
  }

  render() {
    return (
      <div>
        <input
          value={this.query}
          onChange={(e) => {
            this.query = e.target.value
          }}
        />
        <ul>
          {this.items.map((item) => (
            <li>{item.name}</li>
          ))}
        </ul>
      </div>
    )
  }
}

export const AutoComplete = component.fromViewModel<AutoCompleteProps>(AutoCompleteViewModel)
```

### Lifecycle

Thera are lifecycle decorators for services and view models. Decorated methods will reflect the actual component lifecycle. When they are used in a service they reflect the lifecycle of the ServiceProvider component. When used in a view model that view model’s component will be reflected.

- **@onMount**: called when the component is mounted
- **@onUnmount**: called when the component is unmounted
- **@onInit**: called when the service/viewModel class is constructed and all the decorators are initialized
- **@onDispose**: called when the parent dependency container is disposed

Methods with onMount/onInit decorators accept a cleanup function as parameter (as well as @trigger methods). Function passed to cleanup will be called when the component is unmounted/disposed.

```tsx
import { onMount, onUnmount, onInit, onDispose, type Cleanup } from 'impair'

@injectable()
export class TodoService {
  @state
  public todos: Todo[] = []

  @onMount
  async loadTodos(cleanup: Cleanup) {
    controller = new AbortController()

    const signal = controller.signal

    // the function passed to cleanup will be called
    // when the component is unmounted
    cleanup(() => controller.abort())

    const response = await fetch('/Todos', { signal: controller.signal })

    this.todos = await response.json()
  }
}
```

### Container (Injection Token)

You can inject the dependency container instance by injecting the **Container** injection token.

With container instance you can register or inject services on demand with **resolve** and register functions.

```tsx
import { Container, inject, injectable } from 'impair'

@injectable()
class Service {
  constructor(@inject(Container) container: Container) {
    const service = container.resolve('someToken')
  }
}
```

### configure(options)

This is a global configuration api to control some behaviors of the framework. If necessary this must be called once on the top of your application code.

- **readonlyProxiesForView** (bool) - default: true
  By default the reactive data passed to component will be marked as readonly and throw a warning if you mutate it in component scope. You can change it by setting **readonlyProxiesForView** to false.
- defaultStateReactiveLevel: ('shallow' | 'deep' | 'atom’) - default: ‘deep’
  Global reactivity level of @state field is determined by this property. You can always explicitly declare the reactivity level on fields with @state.atom, @state.shallow and @state.deep decorators.

```tsx
import { configure } from 'impair'

configure({
	readonlyProxiesForView: false
	defaultStateReactiveLevel: 'atom'
})
```
