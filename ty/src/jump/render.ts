import { RenderFn } from '../common/engine'

export const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)
}
