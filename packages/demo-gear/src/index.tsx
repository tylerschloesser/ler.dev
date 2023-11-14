import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { GEAR_SIZES, TILE_SIZE } from './const.js'
import styles from './index.module.scss'
import { initCanvas } from './init-canvas.js'
import { initSimulator } from './init-simulator.js'
import { Toolbar } from './toolbar.js'
import {
  AddGearPointer,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Connection,
  ConnectionType,
  Gear,
  GearId,
  InitPointerFn,
  Pointer,
  PointerType,
  Vec2,
  World,
  initKeyboardFn,
} from './types.js'
import { getEnergy, getNetwork } from './util.js'

function addGear({
  size,
  position,
  chain,
  world,
}: {
  size: number
  position: Vec2
  chain?: Gear
  world: World
}): void {
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}`
  invariant(world.gears[gearId] === undefined)

  const connections = getConnections({
    size,
    position,
    world,
  })

  let sign = 0
  if (connections.length > 0) {
    const neighbors = connections.map((connection) => {
      const neighbor = world.gears[connection.gearId]
      invariant(neighbor)
      return neighbor
    })

    const [first, ...rest] = neighbors
    invariant(first)

    // sign is the opposite of the neighbor
    sign = Math.sign(first.velocity) * -1

    for (const neighbor of rest) {
      invariant(sign === Math.sign(neighbor.velocity) * -1)
    }

    neighbors.forEach((neighbor) => {
      neighbor.connections.push({
        type: ConnectionType.Direct,
        gearId,
      })
    })
  }

  if (chain) {
    // TODO
    invariant(connections.length === 0)

    sign = Math.sign(chain.velocity)

    connections.push({
      gearId: chain.id,
      type: ConnectionType.Chain,
    })

    chain.connections.push({
      gearId,
      type: ConnectionType.Chain,
    })
  }

  const mass = Math.PI * size ** 2
  const radius = size / 2

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    radius,
    mass,
    angle: 0,
    velocity: 0,
    connections,
  }

  world.gears[gear.id] = gear

  for (
    let x = -((size - 1) / 2);
    x <= (size - 1) / 2;
    x++
  ) {
    for (
      let y = -((size - 1) / 2);
      y <= (size - 1) / 2;
      y++
    ) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))

      const tileId = `${position.x + x}.${position.y + y}`
      invariant(world.tiles[tileId] === undefined)

      world.tiles[tileId] = { gearId }
    }
  }

  const network = getNetwork(gear, world.gears)
  const energy = getEnergy(network)

  const root = gear
  let sum = 0
  for (const node of network) {
    sum += (1 / 4) * node.mass * root.radius ** 2
  }
  root.velocity = sign * Math.sqrt(energy / sum)

  for (const node of network) {
    node.velocity =
      Math.sign(node.velocity) *
      (root.radius / node.radius) *
      Math.abs(root.velocity)
  }
}

function getConnections({
  size,
  position,
  world,
}: {
  size: number
  position: Vec2
  world: World
}): Connection[] {
  const connections = new Set<GearId>()

  for (const delta of [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ]) {
    const point = {
      x: position.x + ((size - 1) / 2 + 1) * delta.x,
      y: position.y + ((size - 1) / 2 + 1) * delta.y,
    }
    const tileId = `${point.x}.${point.y}`
    const tile = world.tiles[tileId]
    if (!tile) {
      continue
    }
    const gear = world.gears[tile.gearId]
    invariant(gear)

    if (
      gear.position.x + -((gear.radius - 0.5) * delta.x) ===
        point.x &&
      gear.position.y + -((gear.radius - 0.5) * delta.y) ===
        point.y
    ) {
      connections.add(tile.gearId)
    }
  }
  return [...connections].map((gearId) => ({
    type: ConnectionType.Direct,
    gearId,
  }))
}

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

  pointer.state = {
    position,
    valid,
  }
}

const initPointer: InitPointerFn = ({
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

const initKeyboard: initKeyboardFn = ({
  signal,
  pointer,
}) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        pointer.current = {
          type: PointerType.Null,
          state: null,
        }
      }
    },
    { signal },
  )
}

function useWorld(): React.MutableRefObject<World> {
  return useRef(
    (() => {
      const world: World = {
        gears: {},
        tiles: {},
      }

      addGear({
        position: {
          x: 0,
          y: 0,
        },
        size: GEAR_SIZES[1]!,
        world,
      })
      addGear({
        position: {
          x: 5,
          y: 0,
        },
        size: GEAR_SIZES[3]!,
        world,
      })

      return world
    })(),
  )
}

export function DemoGear() {
  const pointer = useRef<Pointer>({
    type: PointerType.AddGear,
    size: GEAR_SIZES[0]!,
    state: null,
  })
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)

  const world = useWorld()

  useEffect(() => {
    if (canvas) {
      const controller = new AbortController()
      const { signal } = controller
      initCanvas({
        canvas,
        pointer,
        signal,
        world: world.current,
      })
      initPointer({
        canvas,
        pointer,
        signal,
        world: world.current,
      })
      initKeyboard({ canvas, pointer, signal })
      initSimulator({
        pointer,
        world: world.current,
        signal,
      })
      return () => {
        controller.abort()
      }
    }
  }, [canvas])
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar pointer={pointer} />
      </div>
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}
