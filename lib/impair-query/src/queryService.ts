import { QueryClient, QueryKey, QueryObserver, QueryObserverOptions, QueryObserverResult } from '@tanstack/react-query'
import { state } from 'impair'

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
  @state.atom
  data: T | undefined

  @state.atom
  status: 'success' | 'error' | 'pending' | undefined

  @state.atom
  error: Error | undefined

  @state.atom
  isLoading = false

  @state.atom
  isError = false

  @state.atom
  isSuccess = false

  protected abstract fetch(...params: P): Promise<T>

  protected abstract key: string

  private observer: QueryObserver<T, Error, T, T, P> | undefined

  private unsubscribe: (() => void) | undefined

  public query(...params: P) {
    this.unsubscribe?.()

    const options = this.getQueryOptions(...params)

    if (this.observer) {
      this.observer.setOptions(options)
    } else {
      this.observer = new QueryObserver(client, options)
    }

    this.unsubscribe = this.observer.subscribe((result) => this.updateStates(result))
  }

  protected getQueryOptions(...params: P): QueryObserverOptions<T, Error, T, T, P, never> {
    const queryFn = () => this.fetch(...params)

    return {
      queryKey: [this.key, ...params] as any,
      queryFn,
      placeholderData: (prev) => prev,
    }
  }

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

  protected dispose() {
    this.unsubscribe?.()
    this.observer?.destroy()
    this.observer = undefined
  }
}
