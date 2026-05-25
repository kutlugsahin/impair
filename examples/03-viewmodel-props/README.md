# 03 — ViewModel + Props

A view model receives reactive component props via the `Props` injection token, and a `@trigger` re-runs whenever those props change.

## What this shows

- Passing component props to a view model via the `Props` token
- `@trigger` re-runs when *any* reactive value it reads changes — including injected props
- Cleanup callbacks on triggers (abort in-flight requests when inputs change)

## Files

- `user-view-model.ts` — `UserViewModel` that injects `Props` and fetches when `userId` changes
- `user-view.tsx` — parent component owning the React-side state, child component using `useViewModel`

## Mental model

When you render `<UserCard userId={5} />`, impair makes `{ userId: 5 }` available under the `Props` token in the per-component container. The view model injects it. Reading `this.props.userId` in a `@trigger` registers it as a dep — so when the parent passes a new `userId`, the trigger re-runs (and its previous cleanup runs first, aborting the in-flight request).
