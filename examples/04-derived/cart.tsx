import { component, useViewModel } from 'impair'

import { CartViewModel } from './cart-view-model'

export const Cart = component(function Cart() {
  const { items, subtotal, tax, total, freeShipping, incQty, decQty } = useViewModel(CartViewModel)

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={left}>Item</th>
            <th style={right}>Price</th>
            <th style={right}>Qty</th>
            <th style={right}>Line</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={left}>{item.name}</td>
              <td style={right}>${item.price.toFixed(2)}</td>
              <td style={right}>
                <button onClick={() => decQty(item.id)}>-</button>
                <span style={{ margin: '0 8px' }}>{item.qty}</span>
                <button onClick={() => incQty(item.id)}>+</button>
              </td>
              <td style={right}>${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 16px', margin: 0 }}>
        <dt>Subtotal</dt>
        <dd style={{ margin: 0 }}>${subtotal.toFixed(2)}</dd>
        <dt>Tax (18%)</dt>
        <dd style={{ margin: 0 }}>${tax.toFixed(2)}</dd>
        <dt>Shipping</dt>
        <dd style={{ margin: 0 }}>{freeShipping ? 'free' : '$5.00'}</dd>
        <dt style={{ fontWeight: 'bold' }}>Total</dt>
        <dd style={{ margin: 0, fontWeight: 'bold' }}>${(total + (freeShipping ? 0 : 5)).toFixed(2)}</dd>
      </dl>
    </div>
  )
})

const left = { textAlign: 'left' as const, padding: '6px 4px' }
const right = { textAlign: 'right' as const, padding: '6px 4px' }
