import { injectable } from 'impair'

import { interval } from './interval-decorator'

@injectable()
export class TickViewModel {
  @interval(500)
  fast = 0

  @interval(1000)
  slow = 0
}
