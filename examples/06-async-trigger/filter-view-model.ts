import { injectable, state, trigger } from 'impair'

type Product = { id: number; name: string; price: number }

const CATALOG: Product[] = [
  { id: 1, name: 'Notebook', price: 8 },
  { id: 2, name: 'Pen', price: 3 },
  { id: 3, name: 'Mug', price: 12 },
  { id: 4, name: 'Lamp', price: 35 },
  { id: 5, name: 'Chair', price: 120 },
  { id: 6, name: 'Desk', price: 240 },
  { id: 7, name: 'Keyboard', price: 60 },
  { id: 8, name: 'Mouse', price: 25 },
]

export type Preset = {
  label: string
  query: string
  minPrice: number
  maxPrice: number
}

export const PRESETS: Preset[] = [
  { label: 'Cheap', query: '', minPrice: 0, maxPrice: 15 },
  { label: 'Desk gear', query: '', minPrice: 20, maxPrice: 100 },
  { label: 'Search "mouse"', query: 'mouse', minPrice: 0, maxPrice: 1000 },
  { label: 'Reset', query: '', minPrice: 0, maxPrice: 1000 },
]

@injectable()
export class FilterViewModel {
  @state
  query = ''

  @state
  minPrice = 0

  @state
  maxPrice = 1000

  @state
  results: Product[] = CATALOG

  // How many times the trigger has run. The visible signal for sync vs async.
  @state
  runs = 0

  setQuery(value: string) {
    this.query = value
  }

  setMinPrice(value: number) {
    this.minPrice = value
  }

  setMaxPrice(value: number) {
    this.maxPrice = value
  }

  applyPreset(preset: Preset) {
    // Three reactive mutations in one synchronous method.
    //
    // With @trigger.async (below): the trigger queues to a microtask once and
    //   runs ONCE on the final state — `runs` goes up by 1.
    //
    // With @trigger (sync): the trigger fires after each assignment, observing
    //   the intermediate state — `runs` goes up by 3.
    //
    // Flip the decorator below to see for yourself.
    this.query = preset.query
    this.minPrice = preset.minPrice
    this.maxPrice = preset.maxPrice
  }

  @trigger.async
  recompute() {
    this.runs++
    const q = this.query.toLowerCase()
    this.results = CATALOG.filter(
      (p) => p.name.toLowerCase().includes(q) && p.price >= this.minPrice && p.price <= this.maxPrice,
    )
  }
}
