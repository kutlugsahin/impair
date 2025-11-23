import { component, useResolve, useService } from 'impair/index'
import { Route, Switch } from 'wouter'
import { CounterService } from './counter.service'
import { DragService } from './drag'

export const Content = component(() => {
  const { count, increment } = useService(CounterService)

  const a = useResolve(CounterService)

  const { ref: ref1 } = useResolve(DragService)
  const { ref: ref2 } = useResolve(DragService, {
    onDrag(params) {
      console.log('Dragged to:', params)
    },
  })

  return (
    <div>
      <h1>Dynamic Content</h1>
      <div>
        <button onClick={increment}>Counts11: {count}</button>
        <div></div>
      </div>
      <Switch>
        <Route path="/foo" component={() => <div>Foo Route</div>} />
        <Route path="/bar" component={() => <div>Bar Route</div>} />
      </Switch>

      <div
        style={{
          position: 'relative',
        }}
      >
        <div
          ref={ref1}
          style={{
            padding: '10px',
            border: '1px solid red',
          }}
        ></div>
        <div
          ref={ref2}
          style={{
            padding: '10px',
            border: '1px solid red',
          }}
        ></div>
      </div>
    </div>
  )
})
