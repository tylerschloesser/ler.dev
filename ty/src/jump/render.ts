import Color from 'color'
import { RenderFn } from '../common/engine'
import { renderCircle, renderRectangle } from './render.lib'
import { RenderObject } from './render.types'
import { state } from './state'

export const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  const buffer: RenderObject[] = []

  if (state.pointer) {
    buffer.push({
      type: 'circle',
      method: 'stroke',
      p: state.pointer,
      r: 10,
      color: new Color('white'),
    })
  }

  buffer.forEach((renderObject) => {
    switch (renderObject.type) {
      case 'circle': {
        renderCircle(context, renderObject)
        break
      }
      case 'rectangle': {
        renderRectangle(context, renderObject)
        break
      }
    }
  })
}
