import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import {
  AddGearPointer,
  AddGearPointerStateType,
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
  const { radius, state } = pointer
  if (!state) {
    return
  }

  switch (state.type) {
    case AddGearPointerStateType.Normal: {
      renderGear({
        gear: {
          position: state.position,
          radius,
          angle: 0,
        },
        tint: state.valid
          ? Color.AddGearValid
          : Color.AddGearInvalid,
        context,
      })

      for (const connection of state.connections) {
        const gear2 = world.gears[connection.gearId]
        invariant(gear2)
        renderConnection({
          context,
          gear1: {
            position: state.position,
            radius,
            angle: 0,
            velocity: 0,
          },
          gear2,
          type: connection.type,
          valid: state.valid,
          debug: world.debugConnections,
        })
      }
      break
    }
    case AddGearPointerStateType.Chain: {
      renderGear({
        gear: {
          position: state.position,
          radius,
          angle: 0,
        },
        tint: Color.AddGearValid,
        context,
      })
      break
    }
    case AddGearPointerStateType.Attach: {
      renderGear({
        gear: {
          position: state.position,
          radius,
          angle: 0,
        },
        tint: Color.AddGearValid,
        context,
      })
      break
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
  context.strokeStyle = active
    ? Color.ApplyForceActive
    : Color.ApplyForceInactive
  context.strokeRect(
    (gear.position.x - gear.radius) * TILE_SIZE,
    (gear.position.y - gear.radius) * TILE_SIZE,
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

  const { state } = pointer
  if (state) {
    const radius = 1
    renderGear({
      gear: {
        position: state.position,
        radius,
        angle: 0,
      },
      tint: state.valid
        ? Color.AddGearValid
        : Color.AddGearInvalid,
      context,
    })

    // const connections = [...state.connections]
    // if (state.valid) {
    //   connections.push({
    //     gearId: source.id,
    //     type: ConnectionType.enum.Chain,
    //   })
    // }

    for (const connection of state.connections) {
      const gear2 = world.gears[connection.gearId]
      invariant(gear2)
      renderConnection({
        context,
        gear1: {
          position: state.position,
          radius,
          angle: 0,
          velocity: 0,
        },
        gear2,
        type: connection.type,
        valid: state.valid,
        debug: world.debugConnections,
      })
    }
  }
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
