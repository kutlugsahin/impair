# 13 — Circular dependencies (`delay`)

If two services need each other, the container can't construct one before the other. Wrap *one* side of the cycle with `delay(() => OtherClass)` — impair injects a proxy that resolves lazily on first property access.

## What this shows

- Two services that reference each other
- Breaking the cycle with `@inject(delay(() => OtherService))`
- The proxy behaves like the real instance when its methods are called

## Files

- `services.ts` — `OrderService` and `InvoiceService`, each depending on the other
- `circular-demo.tsx` — click buttons to call across the cycle in both directions

## Mental model

`delay(() => X)` says "I'll inject `X`, but don't try to construct it until somebody actually uses me". The dependency is still injected; the only thing the proxy postpones is the constructor call. Touching any method or field on the proxy materialises the real instance.

Cycles are usually a code smell — but legitimate cases exist (e.g. an event bus where every service registers itself). Use `delay` when you actually need bidirectional references, not as a workaround for tangled responsibilities.
