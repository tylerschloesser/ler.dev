import invariant from 'tiny-invariant'
import { TILE_SIZE } from './const.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import {
  AddGearPointer,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Pointer,
  PointerType,
  World,
} from './types.js'

type RenderPointerFn<T extends Pointer> = (args: {
  pointer: T
  context: CanvasRenderingContext2D
  world: World
}) => void

const renderAddGearPointer: RenderPointerFn<
  AddGearPointer
> = ({ pointer, context, world }) => {
  const { size, state } = pointer
  if (!state) {
    return
  }

  invariant(!(state.chain && state.attach))

  if (state.chain) {
    renderGear({
      gear: {
        position: state.position,
        radius: size / 2,
        angle: 0,
      },
      tint: `hsla(120, 50%, 50%, .5)`,
      context,
    })

    context.beginPath()
    context.lineWidth = 2
    context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
    context.strokeRect(
      state.position.x * TILE_SIZE,
      state.position.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
    )
    context.closePath()
  } else if (state.attach) {
    renderGear({
      gear: {
        position: state.position,
        radius: size / 2,
        angle: 0,
      },
      tint: `hsla(120, 50%, 50%, .5)`,
      context,
    })
  } else {
    renderGear({
      gear: {
        position: state.position,
        radius: size / 2,
        angle: 0,
      },
      tint: state.valid
        ? `hsla(120, 50%, 50%, .5)`
        : `hsla(0, 50%, 50%, .5)`,
      context,
    })

    for (const connection of state.connections) {
      const gear2 = world.gears[connection.gearId]
      invariant(gear2)
      renderConnection({
        context,
        gear1: { position: state.position },
        gear2,
        type: connection.type,
      })
    }
  }
}

const renderApplyForcePointer: RenderPointerFn<
  ApplyForcePointer
> = ({ pointer, context, world }) => {
  const { state } = pointer
  if (!state || !state.gearId) {
    return
  }
  const gear = world.gears[state.gearId]
  invariant(gear)

  const { active } = state

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

const renderAddGearWithChainPointer: RenderPointerFn<
  AddGearWithChainPointer
> = ({ pointer, context, world }) => {
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
      },
      tint: state.valid
        ? `hsla(120, 50%, 50%, .5)`
        : `hsla(0, 50%, 50%, .5)`,
      context,
    })

    for (const connection of state.connections) {
      const gear2 = world.gears[connection.gearId]
      invariant(gear2)
      renderConnection({
        context,
        gear1: { position: state.position },
        gear2,
        type: connection.type,
      })
    }

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
  context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
  context.strokeRect(
    chain.x * TILE_SIZE,
    chain.y * TILE_SIZE,
    chain.w * TILE_SIZE,
    chain.h * TILE_SIZE,
  )
  context.closePath()
}

export function renderPointer({
  pointer,
  context,
  world,
}: {
  pointer: Pointer
  context: CanvasRenderingContext2D
  world: World
}): void {
  switch (pointer.type) {
    case PointerType.AddGear:
      renderAddGearPointer({ pointer, context, world })
      break
    case PointerType.AddGearWithChain:
      renderAddGearWithChainPointer({
        pointer,
        context,
        world,
      })
      break
    case PointerType.ApplyForce:
      renderApplyForcePointer({ pointer, context, world })
      break
  }
}
