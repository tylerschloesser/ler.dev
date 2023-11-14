import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import { TILE_SIZE } from './const.js'
import { getConnections } from './get-connections.js'
import {
  AddGearPointer,
  AddGearPointerStateType,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Connection,
  GearId,
  InitPointerFn,
  Pointer,
  PointerType,
  World,
} from './types.js'
import { iterateGearTiles } from './util.js'

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

  let chain: GearId | null = null
  let attach: GearId | null = null
  let valid = true

  for (const tile of iterateGearTiles(
    position,
    size,
    world,
  )) {
    valid = false

    const gear = world.gears[tile.gearId]
    invariant(gear)

    if (pointer.size === 1 && gear.radius === 0.5) {
      chain = gear.id
    } else if (
      pointer.size === 1 &&
      gear.radius > 0.5 &&
      gear.position.x === position.x &&
      gear.position.y === position.y
    ) {
      attach = gear.id
    }
  }

  let connections: Connection[] = []
  if (valid) {
    connections = getConnections({ position, size, world })
  }

  invariant(!(chain && attach))

  if (chain) {
    pointer.state = {
      type: AddGearPointerStateType.Chain,
      chain,
      position,
      connections,
    }
  } else if (attach) {
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

const updatePointer: UpdatePointerFn<Pointer> = ({
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

type HandlePointerEventFn = (args: {
  e: PointerEvent
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  world: World
}) => void

const handlePointerMove: HandlePointerEventFn = ({
  e,
  canvas,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    canvas,
    pointer: pointer.current,
    world,
  })
}

const handlePointerUp: HandlePointerEventFn = ({
  e,
  canvas,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    canvas,
    pointer: pointer.current,
    world,
  })
  let needsUpdate = false
  switch (pointer.current.type) {
    case PointerType.AddGear: {
      switch (pointer.current.state?.type) {
        case AddGearPointerStateType.Normal: {
          if (pointer.current.state.valid) {
            addGear({
              position: pointer.current.state.position,
              size: pointer.current.size,
              world,
            })
            needsUpdate = true
          }
          break
        }
        case AddGearPointerStateType.Chain: {
          pointer.current = {
            type: PointerType.AddGearWithChain,
            sourceId: pointer.current.state.chain,
            state: null,
          }
          needsUpdate = true
          break
        }
        case AddGearPointerStateType.Attach: {
          console.log('TODO')
          break
        }
      }
      break
    }
    case PointerType.AddGearWithChain: {
      if (pointer.current.state?.valid) {
        const chain = world.gears[pointer.current.sourceId]
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
        needsUpdate = true
      }
      break
    }
  }
  if (needsUpdate) {
    updatePointer({
      e,
      canvas,
      pointer: pointer.current,
      world,
    })
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
      handlePointerMove({ e, canvas, pointer, world })
    },
    {
      signal,
    },
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
      handlePointerUp({ e, canvas, pointer, world })
    },
    {
      signal,
    },
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
