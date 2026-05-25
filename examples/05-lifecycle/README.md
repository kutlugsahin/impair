# 05 — Lifecycle

Every lifecycle hook in one place, with cleanups. Toggle the consumer component to see `onMount` / `onUnmount` fire; the browser console logs the order.

## What this shows

- `@onInit` — fires when the instance is constructed (on first resolve from the container)
- `@onMount` — fires when the host React component mounts
- `@onUnmount` — fires when the host React component unmounts
- `@onDispose` — fires when the container is disposed (after `onUnmount`)
- Cleanup callbacks on `@onInit` / `@onMount` run at the symmetric tear-down point

## Files

- `lifecycle-view-model.ts` — a VM with all four hooks logging to the console
- `lifecycle-demo.tsx` — host with a toggle so mount/unmount fire visibly

## Mental model

`@onInit` is about *the instance*. `@onMount` is about *the React lifetime of its host*. They differ when a service is registered eagerly but only mounted lazily, or when a transient VM is created without ever being mounted. For UI-bound work (timers, subscriptions, fetches), use `@onMount`. For one-time setup of the instance itself, use `@onInit`. Keep an eye on the console.
