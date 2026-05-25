# 07 — `@provide` on a view model

A view model can declare its own services with the `@provide` class decorator. Those services live in the per-component container created for that VM, so each component instance gets a private copy.

## What this shows

- `@provide([...registrations])` as a class decorator
- Each `useViewModel(EditorViewModel)` produces an isolated set of dependencies
- Sibling components don't share the inner state

## Files

- `history-service.ts` — undo/redo stack
- `editor-view-model.ts` — `@provide([HistoryService])` and injects it
- `editor.tsx` — renders two editors side-by-side; each has its own history

## Mental model

`@provide` on a VM is functionally the same as wrapping the component in a `ServiceProvider`, except scoped to the VM's container. Use it when a VM has internal collaborators that should never leak to siblings or to consumers up the tree.
