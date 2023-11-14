import invariant from 'tiny-invariant'
import { TILE_SIZE } from './const.js'
import { renderGear } from './render-gear.js'
import { Pointer, PointerType, World } from './types.js'

export function renderPointer({
  pointer,
  context,
  world,
}: {
  pointer: Pointer
  context: CanvasRenderingContext2D
  world: World
}): void {
  if (
    pointer.type === PointerType.AddGear &&
    pointer.state
  ) {
    const { size, state } = pointer
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
    pointer.type === PointerType.ApplyForce &&
    pointer.state?.gearId
  ) {
    const gear = world.gears[pointer.state.gearId]
    const { active } = pointer.state
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

  if (pointer.type === PointerType.AddGearWithChain) {
    const source = world.gears[pointer.sourceId]
    invariant(source)

    let chain = {
      x: source.position.x,
      y: source.position.y,
      w: 1,
      h: 1,
    }

    const { state } = pointer
    if (state) {
      renderGear({
        gear: {
          position: state.position,
          radius: 0.5,
          angle: 0,
          connections: state.connections,
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
}
