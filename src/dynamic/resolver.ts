import { Props } from 'impair/index'
import { inject, injectable } from 'tsyringe'

@injectable()
export class Resolver {
  constructor(@inject(Props) public props: { name: string }) {}
}
