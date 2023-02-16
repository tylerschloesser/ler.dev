import Color from 'color'
import { RenderFn } from '../common/engine'
import { renderCircle, renderLine, renderRectangle } from './render.lib'
import { RenderObject } from './render.types'
import { state } from './state'

function renderInput(buffer: RenderObject[]) {
  if (state.drag?.b) {
    buffer.push({
      type: 'line',
      a: state.drag.a,
      b: state.drag.b,
      color: new Color('white'),
    })
    buffer.push({
      type: 'circle',
      method: 'stroke',
      p: state.drag.b,
      r: 10,
      color: new Color('white'),
    })
  } else if (state.pointer) {
    buffer.push({
      type: 'circle',
      method: 'stroke',
      p: state.pointer,
      r: 10,
      color: new Color('white'),
    })
  }
}

function renderBall(buffer: RenderObject[]) {
  if (!state.ball) return

  buffer.push({
    type: 'circle',
    method: 'fill',
    p: state.ball.p,
    r: 20,
    color: new Color('blue'),
  })
}

export const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  const buffer: RenderObject[] = []

  renderInput(buffer)
  renderBall(buffer)

  renderBuffer(context, buffer)
}

function renderBuffer(
  context: CanvasRenderingContext2D,
  buffer: RenderObject[],
) {
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
      case 'line': {
        renderLine(context, renderObject)
        break
      }
      default: {
        throw Error('todo')
      }
    }
  })
}
