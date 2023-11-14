import invariant from 'tiny-invariant'
import { TILE_SIZE } from './const.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'
import { InitCanvasFn, PointerType } from './types.js'

export const initCanvas: InitCanvasFn = ({
  canvas,
  pointer,
  signal,
  world,
}) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  function render() {
    if (signal.aborted) {
      return
    }

    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.translate(canvas.width / 2, canvas.height / 2)

    renderGrid({ canvas, context })

    for (const gear of Object.values(world.gears)) {
      renderGear({ gear, context, world })
    }

    if (
      pointer.current.type === PointerType.AddGear &&
      pointer.current.state
    ) {
      const { size, state } = pointer.current
      if (state.chain) {
        context.beginPath()
        context.lineWidth = 2
        context.strokeStyle = 'white'
        context.strokeRect(
          state.position.x * TILE_SIZE,
          state.position.y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        )
        context.closePath()
      } else {
        renderGear({
          gear: {
            position: state.position,
            radius: size / 2,
            angle: 0,
            connections: state.connections,
          },
          tint: state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
          context,
          world,
        })
      }
    }

    if (
      pointer.current.type === PointerType.ApplyForce &&
      pointer.current.state?.gearId
    ) {
      const gear = world.gears[pointer.current.state.gearId]
      const { active } = pointer.current.state
      invariant(gear)

      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = active ? 'green' : 'white'
      context.strokeRect(
        (gear.position.x - (gear.radius - 0.5)) * TILE_SIZE,
        (gear.position.y - (gear.radius - 0.5)) * TILE_SIZE,
        TILE_SIZE * gear.radius * 2,
        TILE_SIZE * gear.radius * 2,
      )
      context.closePath()
    }

    if (
      pointer.current.type === PointerType.AddGearWithChain
    ) {
      const source = world.gears[pointer.current.sourceId]
      invariant(source)

      let chain = {
        x: source.position.x,
        y: source.position.y,
        w: 1,
        h: 1,
      }

      const { state } = pointer.current
      if (state) {
        renderGear({
          gear: {
            position: state.position,
            radius: 0.5,
            angle: 0,
            connections: [], // TODO
          },
          tint: state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
          world,
          context,
        })

        if (state.valid) {
          chain = {
            x: Math.min(chain.x, state.position.x),
            y: Math.min(chain.y, state.position.y),
            w: Math.abs(chain.x - state.position.x) + 1,
            h: Math.abs(chain.y - state.position.y) + 1,
          }
        }
      }

      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = 'white'
      context.strokeRect(
        chain.x * TILE_SIZE,
        chain.y * TILE_SIZE,
        chain.w * TILE_SIZE,
        chain.h * TILE_SIZE,
      )
      context.closePath()
    }

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}
