import { state } from 'impair'
import { QueryClient, QueryKey, QueryObserver, QueryObserverResult } from '@tanstack/react-query'

let client: QueryClient

export function setQueryClient(queryClient: QueryClient) {
  client = queryClient
}

type QueryState<R> = {
  data: R | undefined
  status: 'success' | 'error' | 'pending' | undefined
  error: Error | undefined
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

export abstract class QueryService<T, P extends QueryKey> implements QueryState<T> {
  @state.shallow
  data: T | undefined

  @state.shallow
  status: 'success' | 'error' | 'pending' | undefined

  @state.shallow
  error: Error | undefined

  @state.shallow
  isLoading = false

  @state.shallow
  isError = false

  @state.shallow
  isSuccess = false

  protected abstract fetch(...params: P): Promise<T>

  protected abstract key: string

  private observer: QueryObserver<T, Error, T, T, P> | undefined

  private unsubscribe: (() => void) | undefined

  private updateStates(result?: QueryObserverResult<T, Error>) {
    if (result) {
      this.data = result.data
      this.status = result.status
      this.error = result.error ?? undefined
      this.isLoading = result.isLoading
      this.isError = result.isError
      this.isSuccess = result.isSuccess
    }
  }

  public query(...params: P) {
    this.unsubscribe?.()

    if (this.observer) {
      this.observer.destroy()
    }

    const queryFn = () => this.fetch(...params)

    this.observer = new QueryObserver(client, {
      queryKey: [this.key, ...params] as any as P,
      queryFn: queryFn,
      placeholderData: (prev) => prev,
    })

    this.unsubscribe = this.observer.subscribe((result) => this.updateStates(result))
  }

  protected dispose() {
    this.observer?.destroy()
    this.observer = undefined
  }
}
