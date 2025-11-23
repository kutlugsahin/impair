import { inject, injectable, onMount, Props } from 'impair'
import { createRef } from 'react'

type DragParams = {
  x: number
  y: number
}

type DragProps = {
  onDrag: (params: DragParams) => void
}

@injectable()
export class DragService {
  public readonly ref = createRef<HTMLDivElement>()

  constructor(@inject(Props) public props: DragProps) {}

  @onMount
  public setup() {
    const element = this.ref.current
    if (!element) return

    let isDragging = false
    let startX = 0
    let startY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      element.style.position = 'absolute'
      element.style.left = `${dx}px`
      element.style.top = `${dy}px`

      this.props.onDrag?.({ x: dx, y: dy })
    }

    const onMouseUp = () => {
      isDragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    element.addEventListener('mousedown', onMouseDown)

    return () => {
      element.removeEventListener('mousedown', onMouseDown)
    }
  }
}
