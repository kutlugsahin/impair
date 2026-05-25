# 08 — `component.fromViewModel`

A view model can include a `render()` method and be turned into a component in one line. This collapses the "VM + thin wrapper component" boilerplate when there's nothing else to put in the component.

## What this shows

- A VM implementing `RendererViewModel` (a class with a `render()` method)
- `component.fromViewModel(ClockViewModel)` produces the React component
- `@onMount` / cleanup for an interval; `@state` driving the render

## Files

- `clock-view-model.tsx` — the VM is both the state holder and the renderer
- (no separate component file — `component.fromViewModel` is exported from the VM file's neighbour for clarity)

## Mental model

If the only thing a component does is `useViewModel(X)` and render `X`, the wrapper is redundant. `component.fromViewModel(X)` is the shorthand. Use it when the VM and the view are 1:1; promote back to a separate component when the view starts holding its own React-side state.
