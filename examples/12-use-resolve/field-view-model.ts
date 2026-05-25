import { derived, inject, injectable, Props, state } from 'impair'

export type FieldProps = {
  label: string
  initial: string
  validate: (value: string) => string | null
}

let seq = 0

@injectable()
export class FieldViewModel {
  readonly instanceId = ++seq

  @state
  value = ''

  @state
  touched = false

  constructor(@inject(Props) public props: FieldProps) {
    this.value = props.initial
  }

  @derived
  get error() {
    return this.props.validate(this.value)
  }

  @derived
  get showError() {
    return this.touched && this.error != null
  }

  setValue(next: string) {
    this.value = next
  }

  blur() {
    this.touched = true
  }

  reset() {
    this.value = this.props.initial
    this.touched = false
  }
}
