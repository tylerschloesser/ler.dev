import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import { TILE_SIZE } from './const.js'
import { getConnections } from './get-connections.js'
import {
  AddGearPointer,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Connection,
  GearId,
  InitPointerFn,
  Pointer,
  PointerType,
  World,
} from './types.js'

type UpdatePointerFn<T extends Pointer> = (args: {
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

  const gearId = tile?.gearId

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

  const { size } = pointer
  const radius = (size - 1) / 2

  let chain: GearId | null = null
  let valid = true
  for (let x = -radius; x <= radius && valid; x++) {
    for (let y = -radius; y <= radius && valid; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))

      const tileId = `${position.x + x}.${position.y + y}`
      const tile = world.tiles[tileId]
      if (tile) {
        valid = false

        const gear = world.gears[tile.gearId]
        invariant(gear)
        if (pointer.size === 1 && gear.radius === 0.5) {
          chain = gear.id
        }
      }
    }
  }

  let connections: Connection[] = []
  if (valid) {
    connections = getConnections({ position, size, world })
  }

  pointer.state = {
    position,
    connections,
    valid,
    chain,
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

  const tileId = `${position.x}.${position.y}`
  const tile = world.tiles[tileId]

  let valid = true

  if (tile) {
    valid = false
  } else {
    const dx = position.x - source.position.x
    const dy = position.y - source.position.y

    if (!(dx === 0 || dy === 0)) {
      valid = false
    } else if (!(Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      valid = false
    }
  }

  let connections: Connection[] = []
  if (valid) {
    connections = getConnections({
      position,
      size: 1,
      world,
    })
  }

  pointer.state = {
    position,
    valid,
    connections,
  }
}
export const initPointer: InitPointerFn = ({
  canvas,
  pointer,
  signal,
  world,
}) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      switch (pointer.current.type) {
        case PointerType.AddGear: {
          updateAddGearPointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          break
        }
        case PointerType.AddGearWithChain: {
          updateAddGearWithChainPointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          break
        }
        case PointerType.ApplyForce: {
          updateApplyForcePointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          break
        }
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    () => {
      pointer.current.state = null
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => {
      switch (pointer.current.type) {
        case PointerType.AddGear: {
          updateAddGearPointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          if (pointer.current.state?.chain) {
            pointer.current = {
              type: PointerType.AddGearWithChain,
              sourceId: pointer.current.state.chain,
              state: null,
            }
            updateAddGearWithChainPointer({
              e,
              canvas,
              pointer: pointer.current,
              world,
            })
          } else if (pointer.current.state?.valid) {
            const { size } = pointer.current
            addGear({
              position: pointer.current.state.position,
              size,
              world,
            })

            // update again in case we need to show chain option
            updateAddGearPointer({
              e,
              canvas,
              pointer: pointer.current,
              world,
            })
          }
          break
        }
        case PointerType.AddGearWithChain: {
          if (pointer.current.state?.valid) {
            const chain =
              world.gears[pointer.current.sourceId]
            invariant(chain)
            addGear({
              position: pointer.current.state.position,
              size: 1,
              chain,
              world,
            })

            pointer.current = {
              type: PointerType.AddGear,
              size: 1,
              state: null,
            }
            updateAddGearPointer({
              e,
              canvas,
              pointer: pointer.current,
              world,
            })
          }
          break
        }
        case PointerType.ApplyForce: {
          updateApplyForcePointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          break
        }
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      switch (pointer.current.type) {
        case PointerType.ApplyForce: {
          updateApplyForcePointer({
            e,
            canvas,
            pointer: pointer.current,
            world,
          })
          break
        }
      }
    },
    { signal },
  )
}
