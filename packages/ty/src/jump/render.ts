import Color from 'color'
import { RenderFn } from '../common/engine/index.js'
import { Vec2 } from '../common/vec2.js'
import { update } from './physics.js'
import { renderCircle, renderLine, renderRectangle } from './render.lib.js'
import { RenderObject } from './render.types.js'
import { state } from './state.js'

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

function renderBall(buffer: RenderObject[], translate: Vec2) {
  if (!state.ball) return
  buffer.push({
    type: 'circle',
    method: 'fill',
    p: state.ball.p.add(translate),
    r: state.ball.r,
    color: new Color('blue'),
  })
}

function renderTargets(buffer: RenderObject[], translate: Vec2) {
  state.targets.forEach(({ p, r }) => {
    buffer.push({
      type: 'circle',
      method: 'fill',
      p: p.add(translate),
      r,
      color: new Color('red'),
    })
    buffer.push({
      type: 'circle',
      method: 'stroke',
      p: p.add(translate),
      r: r * 3,
      color: new Color('red'),
    })
  })
}

export const render: RenderFn = ({ context, elapsed }) => {
  context.clearRect(0, 0, state.viewport.w, state.viewport.h)
  update({ elapsed })

  const buffer: RenderObject[] = []

  renderInput(buffer)

  const translate = state.camera.p.mul(-1)
  renderTargets(buffer, translate)
  renderBall(buffer, translate)

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
