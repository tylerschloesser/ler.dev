import { RenderFn } from '../common/engine'
import { state } from './state'

export const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)
  if (state.pointer) {
    const { x, y } = state.pointer
    context.strokeStyle = 'white'
    context.lineWidth = 2
    context.beginPath()
    context.arc(x, y, 20, 0, Math.PI * 2)
    context.stroke()
  }
}
