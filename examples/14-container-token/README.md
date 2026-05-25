# 14 — `Container` token

Injecting the `Container` token gives a service access to its own container — useful for *dynamic* resolution at runtime, e.g. a plugin registry that resolves handlers by string token.

## What this shows

- Injecting `Container` into a service
- Looking up services by a runtime token (string) instead of a compile-time class reference
- A plugin-style pattern where handlers register themselves under a shared token

## Files

- `services.ts` — `EventBus` injects `Container`; handler classes are registered with the same `'EventHandler'` token; `EventBus.dispatch(name)` iterates all registrations and calls them
- `plugin-demo.tsx` — clicking buttons fires events that flow through every registered handler

## Mental model

90% of the time, prefer constructor injection by class. The `Container` token is the escape hatch for the remaining 10%: when the *set* of dependencies is determined at runtime (extension points, plugin loaders, command palettes). The pattern is the same one you'd use with `@multiInject` in Inversify or `getAll` in NestJS.
