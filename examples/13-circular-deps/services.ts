import { delay, inject, injectable, state } from 'impair'

@injectable()
export class OrderService {
  @state
  log: string[] = []

  // Break the cycle on this side. `InvoiceService` injects `OrderService` directly,
  // so this side has to be the one wrapped with `delay(...)`.
  constructor(@inject(delay(() => InvoiceService)) private invoices: InvoiceService) {}

  placeOrder(item: string) {
    this.log.push(`order placed: ${item}`)
    this.invoices.issueFor(item)
  }
}

@injectable()
export class InvoiceService {
  @state
  log: string[] = []

  constructor(@inject(OrderService) private orders: OrderService) {}

  issueFor(item: string) {
    this.log.push(`invoice issued for: ${item}`)
  }

  refund(item: string) {
    this.log.push(`refund issued for: ${item}`)
    this.orders.log.push(`refund recorded against order: ${item}`)
  }
}
