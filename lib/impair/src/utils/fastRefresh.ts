type RefreshReg = (type: unknown, id: string) => void
type SignatureFn = (
  type: unknown,
  signature: string,
  forceReset?: boolean,
  getCustomHooks?: () => unknown[],
) => unknown
type SignatureFactory = () => SignatureFn

function getGlobal(): Record<string, unknown> | undefined {
  if (typeof globalThis !== 'undefined') return globalThis as unknown as Record<string, unknown>
  if (typeof self !== 'undefined') return self as unknown as Record<string, unknown>
  if (typeof window !== 'undefined') return window as unknown as Record<string, unknown>
  return undefined
}

let anonymousCounter = 0

/**
 * Registers a library-produced wrapper component with the active react-refresh runtime.
 * No-op when react-refresh is not available (production builds, SSR, non-Vite/Webpack tooling).
 *
 * Without this, `component()` returns a fresh `memo(...)` wrapper every time a user module
 * re-evaluates under HMR. React then sees a brand-new component type, unmounts the old subtree
 * and remounts a new one, which destroys all view-model state on every save.
 */
export function registerComponentForFastRefresh(
  comp: unknown,
  fn: { displayName?: string; name?: string; toString?: () => string } | undefined,
  idOverride?: string,
): void {
  const g = getGlobal()
  if (!g) return

  const reg = g.$RefreshReg$ as RefreshReg | undefined
  if (typeof reg !== 'function') return

  const id = idOverride || fn?.displayName || fn?.name || `ImpairComponent_${++anonymousCounter}`

  reg(comp, id)

  const sigFactory = g.$RefreshSig$ as SignatureFactory | undefined
  if (typeof sigFactory !== 'function') return

  const sig = sigFactory()
  // Including the user FC source in the signature lets react-refresh tell apart a meaningful
  // body change (forcing a remount) from an incidental module re-evaluation (preserving state).
  const signatureSource = fn?.toString?.() ?? `impair:${id}`
  sig(comp, signatureSource, false, undefined)
}
