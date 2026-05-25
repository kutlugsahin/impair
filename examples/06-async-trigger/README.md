# 06 — Triggers (sync vs async)

A `@trigger` method runs **synchronously** after every `@state` assignment it depends on. `@trigger.async` defers the call to the next microtask, which collapses multiple sync mutations in the same tick into a single run.

## What this shows

- `@trigger` is called once per `@state` mutation it observes
- A method that flips several `@state` fields in one synchronous block produces N runs under `@trigger`, but just 1 under `@trigger.async`
- The visible signal is a `runs` counter that the trigger increments

## Files

- `filter-view-model.ts` — three filter fields, an `applyPreset(...)` method that mutates all three, and a `recompute` `@trigger.async`
- `filter-list.tsx` — inputs, preset buttons, run counter, filtered list

## Mental model

`@trigger.async` is for **transactional state updates**: one method that flips several pieces of state that all feed the same derived/effectful step. Sync would re-run the trigger after each assignment, observing intermediate (often invalid) snapshots — and doing work N times. Async waits for the synchronous block to finish, then runs the trigger once on the final state.

Per-keystroke typing into an input runs the trigger about once per keystroke either way — each keystroke is its own task, so there's nothing to coalesce. The batching is visible specifically when one method mutates several reactive fields.

Try the experiment: change `@trigger.async` to `@trigger` in `filter-view-model.ts`. Click a preset — the `runs` counter now jumps by **3** per click instead of **1**.
