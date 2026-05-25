# 09 — Hierarchical containers

`ServiceProvider`s nest. Each one creates a child container of its closest ancestor; resolving a token walks up the chain until something matches.

## What this shows

- A `ThemeService` registered at the outer provider
- A `NotificationService` registered at the inner provider, injecting `ThemeService` (resolved from the parent)
- Two inner providers, each with their own `NotificationService`, but both sharing the outer `ThemeService`

## Files

- `theme-service.ts` — outer service
- `notification-service.ts` — inner service that injects Theme
- `app.tsx` — outer provider wraps the page; two sibling inner providers each have their own notifications

## Mental model

Service lookup is "scope chain" semantics. An inner container can inject anything its ancestors have registered, but ancestors cannot see children. Each inner provider's services have their own identity, while shared roots (theme, auth, API client) live at one place near the top.
