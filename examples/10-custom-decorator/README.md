# 10 — Custom decorator

`createDecorator` lets you build domain-specific reactive primitives. The factory receives the instance, the property key, and Vue's reactivity primitives — and returns an optional dispose function that runs when the instance is torn down.

## What this shows

- Building a `@interval(ms)` decorator that increments a field on a timer
- Using `shallowRef` from the injected reactivity API to make the field reactive
- Returning a disposer so the timer is cancelled when the container is disposed

## Files

- `interval-decorator.ts` — the custom decorator
- `tick-view-model.ts` — uses `@interval(500)` and `@interval(1000)` on two fields
- `tick.tsx` — renders both counters

## Mental model

Custom decorators sit at the same layer as `@state` / `@derived` / `@trigger` — they own a field's reactivity contract and can subscribe to anything (timers, web sockets, browser APIs). Reach for one when you have a *cross-cutting* reactive concern that's awkward to express as a `@trigger`: anything that produces values *into* the instance rather than reacting *to* it.
