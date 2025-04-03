# Impair

Impair is a framework for building React applications using a layered architecture approach with object-oriented programming principles and a powerful dependency injection system.

## Installation

```bash
# Using npm
npm install impair

# Using yarn
yarn add impair

# Using pnpm
pnpm add impair
```

## Motivation

Modern React applications often become complex and difficult to maintain as they grow. While React provides excellent UI rendering capabilities, it doesn't enforce any particular architecture for organizing business logic, services, and data flow.

Impair addresses these challenges by:

1. **Enforcing Separation of Concerns** - Organizing code into distinct layers (UI, application logic, domain, data)
2. **Enhancing Testability** - Making components and services easily testable through dependency injection
3. **Improving Maintainability** - Using OOP principles to create well-structured, modular code
4. **Reducing Boilerplate** - Providing clean abstractions to handle common patterns

Rather than mixing UI components with application logic, Impair encourages a clean separation that leads to more maintainable and scalable applications.

## Core Concepts

### Layered Architecture

Impair promotes organizing your application in distinct layers:

- **Presentation Layer** - React components that render UI
- **Application Layer** - Services that orchestrate use cases
- **Domain Layer** - Business logic and entity models
- **Data Layer** - APIs, repositories, and external data sources

### Dependency Injection

With Impair's DI system, you can:

- Register services and dependencies in a container
- Inject dependencies into components and other services
- Create testable code by easily mocking dependencies
- Manage service lifecycles (singleton, transient, etc.)

### Object-Oriented Approach

Impair leverages TypeScript's OOP capabilities to:

- Define clear interfaces for services and components
- Create inheritance hierarchies where appropriate
- Encapsulate related behavior in cohesive classes
- Apply SOLID principles to React development

## API Documentation

### Component Creation

```typescript
import { component } from 'impair';

// Define a component with dependency injection
const UserProfile = component(() => {
  // Component logic here
  return <div>User Profile</div>;
});
```

### Service Integration

```typescript
import { useService, useViewModel } from 'impair';

// Use a service in a component
function UserList() {
  const userService = useService(UserService);
  // Use service methods
  
  return <div>{/* Render user data */}</div>;
}

// Use a view model in a component
function ProductDetails() {
  const viewModel = useViewModel(ProductViewModel);
  // Access view model properties and methods
  
  return <div>{/* Render using view model data */}</div>;
}
```

### Dependency Injection

```typescript
import { injectable, inject } from 'impair';

// Mark a class as injectable
@injectable()
class UserService {
  constructor(
    @inject(ApiClient) private apiClient: ApiClient,
    @inject(LoggerService) private logger: LoggerService
  ) {}
  
  // Service methods
}

// Provide dependencies
import { provide } from 'impair';

@provide(ApiClient, CustomApiClient)
@injectable()
class CustomApiClient implements ApiClient {
  // Implementation
}
```

### Service Provider

```typescript
import { ServiceProvider } from 'impair';

function App() {
  return (
    <ServiceProvider services={[UserService, ProductService]}>
      <YourApp />
    </ServiceProvider>
  );
}
```

### Reactivity System

```typescript
import { state, derived, trigger, untrack } from 'impair';

@injectable()
class CounterViewModel {
  // Create reactive state
  counter = state(0);
  
  // Derived state calculated from other state
  doubleCount = derived(() => this.counter.value * 2);
  
  increment() {
    // Update state
    this.counter.value++;
  }
  
  logWithoutTracking() {
    // Execute code without tracking dependencies
    untrack(() => {
      console.log(this.counter.value);
    });
  }
  
  manuallyTriggerReactions() {
    // Force reactions to run
    trigger();
  }
}
```

### Lifecycle Hooks

```typescript
import { onInit, onMount, onUnmount, onDispose } from 'impair';

@injectable()
class ProfileViewModel {
  constructor() {
    onInit(() => {
      // Called during initialization
      console.log('ViewModel initialized');
    });
    
    onMount(() => {
      // Called when the component using this ViewModel mounts
      this.loadData();
    });
    
    onUnmount(() => {
      // Called when the component using this ViewModel unmounts
      this.cancelRequests();
    });
    
    onDispose(() => {
      // Called when the ViewModel is being disposed
      this.cleanup();
    });
  }
  
  // ViewModel methods
}
```

### Advanced Reactivity Control

```typescript
import { enableTracking, pauseTracking, toRaw, toReadonly } from 'impair';

function complexOperation() {
  // Temporarily pause dependency tracking
  pauseTracking();
  
  // Do operations without creating dependencies
  const result = someCalculation();
  
  // Re-enable tracking
  enableTracking();
  
  // Get the raw, non-reactive version of an object
  const rawData = toRaw(reactiveObject);
  
  // Get readonly version of reactive object
  const readonlyData = toReadonly(reactiveObject);
  
  return result;
}
```

## Example Usage

```typescript
// Define a service
@injectable()
class TodoService {
  private todos = state<Todo[]>([]);
  
  add(todo: Todo) {
    this.todos.value = [...this.todos.value, todo];
  }
  
  getAll() {
    return this.todos.value;
  }
}

// Use in component
const TodoList = component(() => {
  const todoService = useService(TodoService);
  
  onMount(() => {
    // Initialize data on mount
    todoService.loadInitialData();
  });
  
  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todoService.getAll().map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
});
```

## License

MIT
