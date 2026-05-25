# 12 — `useResolve` (transient instances in one component)

`useResolve(Class, props?)` creates a fresh transient instance for **every call site**. Calling it more than once in the same component yields independent instances — that's the thing `useViewModel` cannot do.

## What this shows

- Three `useResolve(FieldViewModel, ...)` calls in **one** component
- Each call gets its own `value` / `touched` / `error` — typing into one field doesn't move the others
- The `props` argument is exposed to each VM via the `Props` token, so the same class can be reused with different per-instance configuration

## Files

- `field-view-model.ts` — `FieldViewModel` parameterised by `{ label, initial, validate }`
- `login-form.tsx` — one form component with three independent fields

## Mental model

`useViewModel(X)` is "give me *the* X for this component" — repeated calls return the same instance. `useResolve(X)` is "give me *an* X" — repeated calls produce different instances. Reach for `useResolve` when one component needs N independent copies of the same class, each with its own props:

- A login form with three field VMs (this example)
- A compare view with two `StockViewModel`s for different symbols
- A wizard step rendering several `SectionViewModel`s with different schemas
- A diff viewer with two `DocumentViewModel`s

If you swap each `useResolve` line below for `useViewModel`, all three fields collapse onto the same VM — you'd be editing one shared field while staring at three identical inputs.
