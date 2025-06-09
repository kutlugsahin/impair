import { injectable, onInit, state } from 'impair'

@injectable()
export class Vm2 {
  @state
  private _count = 0

  constructor() {
    console.log('Vm2 constructor')
  }

  get count() {
    return this._count
  }

  inc() {
    this._count++
  }

  dec() {
    this._count--
  }

  reset() {
    this._count = 0
  }

  @onInit
  alert() {
    alert('Vm2 initialized')
  }
}
