# 04 — Derived state

A `@derived` getter is a cached computed value. It recomputes only when one of the reactive fields it reads changes — never on unrelated re-renders.

## What this shows

- `@derived` on a getter
- Composition: a derived can read other deriveds
- Caching: identical reads return the same value until a dep changes

## Files

- `cart-view-model.ts` — `items` is `@state`, `subtotal` / `tax` / `total` / `freeShipping` are `@derived`
- `cart.tsx` — renders both the rows and the totals; the totals never recompute when an unrelated component re-renders

## Mental model

A `@state` field is the source of truth. A `@derived` getter is a function of state, cached by impair's reactivity tracker — same input, same memoised result. Treat it the same way you'd treat a `select` in Redux or a `computed` in Vue.
