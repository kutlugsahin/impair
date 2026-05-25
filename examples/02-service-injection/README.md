# 02 — Service Injection

Two services where one depends on the other, registered together via `ServiceProvider` and consumed by a component.

## What this shows

- Multiple `@injectable` services in one container
- Constructor injection with `@inject(Class)`
- `ServiceProvider` registering services at a tree boundary
- `useService(Class)` resolving a service from any descendant component
- Services holding state with `@state` — the same instance is shared across all consumers

## Files

- `services.ts` — `TodoApi` (data access) and `TodoService` (state + behaviour)
- `todo-list.tsx` — `ServiceProvider` + consuming component

## Mental model

`ServiceProvider` creates a dependency container. Every descendant of that provider that calls `useService(TodoService)` gets the same singleton instance. Mutating `todos` from any handler triggers a re-render in every component reading it.
