import { derived, injectable, state } from 'impair'

export type CartItem = {
  id: number
  name: string
  price: number
  qty: number
}

const TAX_RATE = 0.18
const FREE_SHIPPING_THRESHOLD = 50

@injectable()
export class CartViewModel {
  @state
  items: CartItem[] = [
    { id: 1, name: 'Coffee beans', price: 14, qty: 1 },
    { id: 2, name: 'Notebook', price: 8, qty: 2 },
    { id: 3, name: 'Pen', price: 3, qty: 4 },
  ]

  @derived
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  @derived
  get tax() {
    return Math.round(this.subtotal * TAX_RATE * 100) / 100
  }

  @derived
  get total() {
    return this.subtotal + this.tax
  }

  @derived
  get freeShipping() {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD
  }

  incQty(id: number) {
    const item = this.items.find((i) => i.id === id)
    if (item) item.qty++
  }

  decQty(id: number) {
    const item = this.items.find((i) => i.id === id)
    if (item && item.qty > 0) item.qty--
  }
}
