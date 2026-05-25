# 01 — Counter

The smallest impair app: one view model with a single reactive field, consumed by one component.

## What this shows

- `@injectable()` — required on every class managed by the container
- `@state` — marks a field as reactive
- `useViewModel(VMClass)` — creates a component-scoped instance
- `component(fn)` — wraps the function component so it re-renders when reactive reads change

## Files

- `counter.tsx` — both the view model and the component

## Mental model

You don't subscribe to anything. The wrapped component just reads `vm.count`; impair tracks that read and re-renders the component when `count` mutates.
