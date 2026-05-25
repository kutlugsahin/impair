# 15 — `untrack` inside a trigger

By default a `@trigger` re-runs whenever *any* reactive value it reads changes. Use `untrack(() => ...)` to read state without subscribing — so the trigger reacts only to the dependencies you actually care about.

## What this shows

- A `@state draft` field that should cause autosave on every change
- A `@state author` field that should appear in the saved snapshot but **not** trigger a save by itself
- The trigger reads `author` through `untrack(() => this.author)`, so renaming the author does nothing until the next time `draft` changes

## Files

- `auto-save-view-model.ts` — `draft` (tracked) + `author` (untracked inside the trigger)
- `auto-save.tsx` — two inputs and the resulting save log

## Mental model

`@trigger` collects dependencies the same way a Vue `watchEffect` does: every reactive read inside the body becomes a subscription. That's almost always what you want. When it isn't — typically when you need a "current snapshot of X at the moment of the event" without coupling the event source to X — wrap the read in `untrack`. The classic uses are:

- Auto-save / sync: subscribe to "content changed"; untrack the user / session / timestamp you want to record on the save.
- Analytics: subscribe to a specific signal; untrack the surrounding context you attach to the event.
- Logging: subscribe to a domain change; untrack secondary state you want to print for debugging.

If you find yourself wrapping most of the trigger body in `untrack`, you probably want a regular method call from a `@trigger` that reads one signal, instead of one big trigger. Treat `untrack` as a precision tool, not a default.
