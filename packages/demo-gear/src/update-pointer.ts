import invariant from 'tiny-invariant'
import { TILE_SIZE } from './const.js'
import { getConnections } from './get-connections.js'
import {
  AddGearPointer,
  AddGearPointerStateType,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Connection,
  ConnectionType,
  Gear,
  GearId,
  Pointer,
  PointerType,
  World,
} from './types.js'
import { iterateGearTiles } from './util.js'

export type UpdatePointerFn<T extends Pointer> = (args: {
  e: PointerEvent
  canvas: HTMLCanvasElement
  pointer: T
  world: World
}) => void

const updateApplyForcePointer: UpdatePointerFn<
  ApplyForcePointer
> = ({ e, canvas, pointer, world }) => {
  const position = {
    x: Math.floor(
      (e.offsetX - canvas.width / 2) / TILE_SIZE,
    ),
    y: Math.floor(
      (e.offsetY - canvas.height / 2) / TILE_SIZE,
    ),
  }

  const tileId = `${position.x}.${position.y}`
  const tile = world.tiles[tileId]

  // gears only overlap if there attached, in which
  // case it doesn't matter which one we accelerate,
  // so pick the first
  //
  const gearId = tile?.gearIds[0]

  const active = Boolean(e.buttons)
  pointer.state = {
    position,
    active,
    gearId,
  }
}

const updateAddGearPointer: UpdatePointerFn<
  AddGearPointer
> = ({ e, canvas, pointer, world }) => {
  const position = {
    x: Math.floor(
      (e.offsetX - canvas.width / 2) / TILE_SIZE,
    ),
    y: Math.floor(
      (e.offsetY - canvas.height / 2) / TILE_SIZE,
    ),
  }

  const { radius } = pointer

  let chain: GearId | null = null
  let attach: GearId | null = null
  let valid = true

  for (const tile of iterateGearTiles(
    position,
    radius,
    world,
  )) {
    valid = false

    if (pointer.radius > 1) {
      // don't bother checking other tiles
      break
    }

    let gear: Gear | undefined

    if (tile.gearIds.length === 1) {
      const gearId = tile.gearIds[0]
      invariant(gearId)
      gear = world.gears[gearId]
    } else {
      invariant(tile.gearIds.length === 2)
      // TODO don't assume the second is the smaller gear?
      const gearId = tile.gearIds[1]
      invariant(gearId)
      gear = world.gears[gearId]
      invariant(gear?.radius === 1)
    }

    invariant(gear)

    if (
      gear.position.x === position.x &&
      gear.position.y === position.y
    ) {
      if (gear.radius === 1) {
        chain = gear.id
      } else {
        attach = gear.id
      }
    }
  }

  let connections: Connection[] = []
  if (valid) {
    connections = getConnections({
      position,
      radius,
      world,
    })
  }

  invariant(!(chain && attach))

  if (chain) {
    connections.push({
      gearId: chain,
      type: ConnectionType.Chain,
    })

    pointer.state = {
      type: AddGearPointerStateType.Chain,
      chain,
      position,
      connections,
    }
  } else if (attach) {
    connections.push({
      gearId: attach,
      type: ConnectionType.Attached,
    })

    pointer.state = {
      type: AddGearPointerStateType.Attach,
      attach,
      connections,
      position,
    }
  } else {
    pointer.state = {
      type: AddGearPointerStateType.Normal,
      connections,
      position,
      valid,
    }
  }
}

const updateAddGearWithChainPointer: UpdatePointerFn<
  AddGearWithChainPointer
> = ({ e, canvas, pointer, world }) => {
  const position = {
    x: Math.floor(
      (e.offsetX - canvas.width / 2) / TILE_SIZE,
    ),
    y: Math.floor(
      (e.offsetY - canvas.height / 2) / TILE_SIZE,
    ),
  }

  const source = world.gears[pointer.sourceId]
  invariant(source)

  let valid = true
  const radius = 1

  for (const _ of iterateGearTiles(
    position,
    radius,
    world,
  )) {
    valid = false
    break
  }

  if (valid) {
    const dx = position.x - source.position.x
    const dy = position.y - source.position.y

    if (!(dx === 0 || dy === 0)) {
      valid = false
    } else if (
      !(
        Math.abs(dx) !== radius * 2 ||
        Math.abs(dy) !== radius * 2
      )
    ) {
      valid = false
    }
  }

  let connections: Connection[] = []
  if (valid) {
    connections = getConnections({
      position,
      radius: 1,
      world,
    })
  }

  connections.push({
    gearId: source.id,
    type: ConnectionType.Chain,
  })

  pointer.state = {
    position,
    valid,
    connections,
  }
}

export const updatePointer: UpdatePointerFn<Pointer> = ({
  e,
  canvas,
  pointer,
  world,
}) => {
  switch (pointer.type) {
    case PointerType.AddGear: {
      updateAddGearPointer({
        e,
        canvas,
        pointer,
        world,
      })
      break
    }
    case PointerType.AddGearWithChain: {
      updateAddGearWithChainPointer({
        e,
        canvas,
        pointer,
        world,
      })
      break
    }
    case PointerType.ApplyForce: {
      updateApplyForcePointer({
        e,
        canvas,
        pointer,
        world,
      })
      break
    }
  }
}
