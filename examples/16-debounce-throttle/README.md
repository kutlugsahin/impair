# 16 — `@trigger.debounce(ms)` and `@trigger.throttle(ms)`

Two scheduler variants on top of `@trigger`: defer the run by `ms` after the last change (debounce), or rate-limit to at most one run per `ms` (throttle).

## What this shows

- Same VM exposes four versions of the same effect, one per scheduler:
  - `@trigger`
  - `@trigger.async`
  - `@trigger.debounce(200)`
  - `@trigger.throttle(200)`
- Drag the slider and watch each variant's run counter and "last value seen" diverge
- The cleanup callback (if you use one) fires before each *actual* invocation, not on each dependency change

## Files

- `slider-view-model.ts` — one `@state value`, four parallel triggers that each snapshot it
- `slider-demo.tsx` — slider + a table of counters

## Mental model

Every `@trigger.*` schedules differently when a dep changes:

| variant                       | when it runs                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `@trigger`                    | synchronously, every dep change                                     |
| `@trigger.async`              | next microtask; collapses same-tick mutations into one run          |
| `@trigger.debounce(ms)`       | `ms` after the most recent dep change; bursts collapse to one run   |
| `@trigger.throttle(ms)`       | immediately on first change + at most one run per `ms` window       |

Picking between them:

- **debounce** = "wait until the input settles": typeahead search, autosave on idle, resize handler that recomputes layout once the user stops dragging.
- **throttle** = "give me regular updates while it's still moving": scroll-driven UI, drag-to-pan minimap, telemetry tick.

The initial run is always immediate — the effect needs to compute its initial state and collect its dependencies. Only subsequent re-runs go through the scheduler.

A pending debounce/throttle timer that fires *after* the host component unmounts is a no-op (the underlying effect is stopped before the timer resolves), so you don't need defensive checks inside the trigger body.
