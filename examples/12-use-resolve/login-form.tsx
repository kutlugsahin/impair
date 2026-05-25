import type { CSSProperties } from 'react'

import { component, useResolve } from 'impair'

import { FieldViewModel } from './field-view-model'

// Validators are defined outside the component so each render passes the same function
// reference to `useResolve` — no spurious re-runs of the derived `error` getter.
const validators = {
  email: (v: string) => (v.includes('@') ? null : 'must contain @'),
  password: (v: string) => (v.length >= 8 ? null : 'min 8 characters'),
  code: (v: string) => (/^\d{6}$/.test(v) ? null : 'must be exactly 6 digits'),
}

export const LoginForm = component(function LoginForm() {
  // THE point of this example: three calls to useResolve(FieldViewModel) in the same
  // component, each producing an independent instance with its own value/touched/error.
  // Replace any of these with useViewModel(FieldViewModel) and all three would share
  // a single instance.
  const email = useResolve(FieldViewModel, {
    label: 'Email',
    initial: '',
    validate: validators.email,
  })
  const password = useResolve(FieldViewModel, {
    label: 'Password',
    initial: '',
    validate: validators.password,
  })
  const code = useResolve(FieldViewModel, {
    label: 'Verify code',
    initial: '',
    validate: validators.code,
  })

  const fields = [email, password, code]
  const allValid = fields.every((f) => f.error == null)

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {fields.map((f) => (
        <FieldRow key={f.instanceId} field={f} />
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" disabled={!allValid}>
          Submit
        </button>
        <button type="button" onClick={() => fields.forEach((f) => f.reset())}>
          Reset all
        </button>
      </div>
    </form>
  )
})

const FieldRow = component(function FieldRow({ field }: { field: FieldViewModel }) {
  return (
    <div style={row}>
      <label style={labelText}>
        {field.props.label} <small style={{ opacity: 0.5 }}>(VM #{field.instanceId})</small>
      </label>
      <input value={field.value} onChange={(e) => field.setValue(e.target.value)} onBlur={field.blur} style={input} />
      <div style={errorLine}>{field.showError ? field.error : ' '}</div>
    </div>
  )
})

const row: CSSProperties = { marginBottom: 12 }
const labelText: CSSProperties = { display: 'block', fontSize: 13, marginBottom: 4 }
const input: CSSProperties = { width: '100%', padding: 8, boxSizing: 'border-box', fontSize: 14 }
const errorLine: CSSProperties = { minHeight: 18, color: '#b3261e', fontSize: 12, marginTop: 2 }
