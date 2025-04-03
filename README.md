# Impair

A framework for building React applications with OOP principles and a layered architecture.

## Motivation

Impair empowers developers to build React applications using a structured, layered architecture with proper separation of concerns. By leveraging OOP principles and dependency injection, Impair makes it easier to:

- Create maintainable and testable code
- Separate business logic from UI components
- Implement proper dependency management
- Use reactive programming patterns

Impair combines the flexibility of React with the structure of traditional OOP frameworks to give you the best of both worlds.

## Installation

```bash
# Using npm
npm install impair reflect-metadata @vue/reactivity tsyringe

# Using yarn
yarn add impair reflect-metadata @vue/reactivity tsyringe
```

Make sure to include `reflect-metadata` in your entry file:

```typescript
// index.ts or index.js
import 'reflect-metadata'
```

## Core Concepts

### Services and Dependency Injection

Create injectable services with proper lifecycle management:

```typescript
import { injectable, onInit, onDispose, state } from 'impair'

@injectable()
export class UserService {
  @state users = []

  @onInit
  initialize() {
    console.log('UserService initialized')
  }

  @onDispose
  cleanup() {
    console.log('UserService being disposed')
  }

  fetchUsers() {
    // Implementation
  }
}
```

### View Models

Separate presentation logic from UI:

```typescript
import { injectable, derived, state } from 'impair'
import { UserService } from './UserService'

@injectable()
export class UserViewModel {
  @state filter = ''

  constructor(private userService: UserService) {}

  @derived
  get filteredUsers() {
    return this.userService.users.filter((user) => user.name.includes(this.filter))
  }

  setFilter(value: string) {
    this.filter = value
  }

  render() {
    return (
      <div>
        <input value={this.filter} onChange={(e) => this.setFilter(e.target.value)} />
        <UserList users={this.filteredUsers} />
      </div>
    )
  }
}
```

### Components

Use components with automatic reactivity:

```typescript
import { component } from 'impair'
import { UserService } from './UserService'

export const UserList = component<{ users: User[] }>((props) => {
  const userService = useService(UserService)

  return (
    <div>
      {props.users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
})
```

Or create components directly from ViewModels:

```typescript
import { component } from 'impair'
import { UserViewModel } from './UserViewModel'

export const UserPage = component.fromViewModel(UserViewModel)
```

## API Reference

### Dependency Injection

#### `@injectable()`

Marks a class as injectable into the dependency container.

```typescript
@injectable()
class MyService {}

// With scope
@injectable('container-scoped')
class ScopedService {}
```

#### `@provide`

Registers dependencies for a component or service.

```typescript
@provide([UserService, [Token, Implementation], [Token, Implementation, 'singleton']])
@injectable()
class AppViewModel {}
```

#### `ServiceProvider`

Provides dependencies to a component tree.

```tsx
<ServiceProvider provide={[UserService, AuthService]} props={{ baseUrl: 'https://api.example.com' }}>
  <App />
</ServiceProvider>
```

### State Management

#### `@state`

Creates reactive state properties.

```typescript
@state count = 0;
@state.shallow users = []; // Shallow reactivity
```

#### `@derived`

Creates computed properties.

```typescript
@derived
get doubleCount() {
  return this.count * 2;
}
```

#### `@trigger`

Creates effects that run when dependencies change.

```typescript
@trigger
updateTitle() {
  document.title = `Count: ${this.count}`;
}

@trigger.async
fetchData() {
  // This will be debounced automatically
}
```

### Lifecycle Hooks

#### `@onInit`

Method called when the service is initialized.

```typescript
@onInit
initialize() {
  // Setup code
}
```

#### `@onDispose`

Method called when the service is being disposed.

```typescript
@onDispose
cleanup() {
  // Cleanup resources
}
```

#### `@onMount`

Method called when a service is mounted into a component tree.

```typescript
@onMount
setupSubscriptions() {
  // Subscribe to events
  return () => {
    // Cleanup function (optional)
  };
}
```

#### `@onUnmount`

Method called when a service is unmounted from a component tree.

```typescript
@onUnmount
cleanupSubscriptions() {
  // Unsubscribe from events
}
```

### Component Hooks

#### `useService`

Hook to access services from components.

```typescript
const userService = useService(UserService)
```

#### `useViewModel`

Hook to use a ViewModel in a component.

```typescript
const viewModel = useViewModel(UserViewModel)
```

## Advanced Usage

### Reactivity Utilities

```typescript
import { untrack, toRaw, toReadonly } from 'impair'

// Prevent tracking in a reactive context
untrack(() => {
  // This won't trigger updates
})

// Get raw unproxied value
const rawUsers = toRaw(this.users)

// Create readonly version
const readonlyUsers = toReadonly(this.users)
```

## License

MIT
