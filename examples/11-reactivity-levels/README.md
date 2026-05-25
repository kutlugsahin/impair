# 11 — Reactivity levels

`@state` has three flavours that trade tracking depth for proxy overhead. Pick the right one for the shape of your data.

## What this shows

- `@state.deep` (the default) — tracks deep mutations on objects, arrays, maps, sets
- `@state.shallow` — only first-level property changes (assignment to a child key) are observed
- `@state.atom` — only reassignment of the whole field is observed

## Files

- `level-view-model.ts` — three identical-looking nested objects, each marked with a different level
- `level-demo.tsx` — buttons to mutate (i) the whole object, (ii) a top-level prop, (iii) a nested prop

## Mental model

Default `@state` is the "just works" option — but it wraps every nested object in a proxy. For huge collections you mutate rarely, or for immutable data you always reassign (`this.user = next`), `@state.atom` is a free upgrade. Use `@state.shallow` for things like Redux-style trees where you do top-level swaps but never reach inside.

Watch the timestamps next to each row — the timestamp only updates when its level "observes" the change.
