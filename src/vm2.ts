import { state } from 'impair'
import { injectable } from 'tsyringe'

@injectable()
export class Vm2 {
  @state
  private _count = 0

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
}
