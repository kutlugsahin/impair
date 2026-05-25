# impair examples

Each numbered folder is a self-contained, single-concept example. Open the folder's `README.md` to see what it teaches, and the `.tsx`/`.ts` files for the actual code.

## Run

```bash
npm run dev
```

Then open the URL Vite prints with `/examples.html` appended (e.g. `http://localhost:5173/examples.html`). Pick an example from the sidebar.

## Examples

| #  | Folder                          | Demonstrates |
| -- | ------------------------------- | ------------ |
| 01 | `01-counter`                    | `@state`, `useViewModel`, `component()` — the smallest possible app |
| 02 | `02-service-injection`          | `ServiceProvider`, `@inject`, `useService` |
| 03 | `03-viewmodel-props`            | `Props` token, `@trigger` with cleanup |
| 04 | `04-derived`                    | `@derived` getters as cached computed values |
| 05 | `05-lifecycle`                  | `@onInit`, `@onMount`, `@onUnmount`, `@onDispose` |
| 06 | `06-async-trigger`              | `@trigger.async` batches several sync `@state` mutations into one run |
| 07 | `07-provide-decorator`          | `@provide` class decorator on a view model |
| 08 | `08-from-view-model`            | `component.fromViewModel` — VM as its own renderer |
| 09 | `09-hierarchical-containers`    | Nested `ServiceProvider`s and parent-fallback resolution |
| 10 | `10-custom-decorator`           | `createDecorator` to build domain-specific reactives |
| 11 | `11-reactivity-levels`          | `@state.deep` vs `@state.shallow` vs `@state.atom` |
| 12 | `12-use-resolve`                | Multiple `useResolve(SameClass)` calls in one component → independent instances |
| 13 | `13-circular-deps`              | `delay(() => OtherService)` to break cycles |
| 14 | `14-container-token`            | Injecting `Container` for runtime plugin-style resolution |
| 15 | `15-untrack`                    | `untrack(() => ...)` inside a `@trigger` for narrower dependencies |
| 16 | `16-debounce-throttle`          | `@trigger.debounce(ms)` and `@trigger.throttle(ms)` side-by-side on a slider |

## Reading these as an LLM

Each example is self-contained: code plus a short README. Read the README first to know what concept the example targets, then the code. The top-level `llms.txt` at the repo root has the full API surface and a flat list of patterns.
