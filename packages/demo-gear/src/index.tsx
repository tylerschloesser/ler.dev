import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import {
  ACCELERATION,
  DRAW_GEAR_BOX,
  FRICTION,
  GEAR_SIZES,
  TICK_DURATION,
  TILE_SIZE,
} from './const.js'
import styles from './index.module.scss'
import { Toolbar } from './toolbar.js'
import {
  AddGearPointer,
  AddGearWithChainPointer,
  ApplyForcePointer,
  Connection,
  ConnectionType,
  Gear,
  GearId,
  InitCanvasFn,
  InitPointerFn,
  InitSimulatorFn,
  Network,
  Pointer,
  PointerType,
  Vec2,
  World,
  initKeyboardFn,
} from './types.js'
import {
  getNetwork,
  getNetworks,
  iterateNetwork,
} from './util.js'

function getEnergy(network: Set<Gear>): number {
  let energy = 0
  for (const node of network) {
    energy +=
      (1 / 4) *
      node.mass *
      node.radius ** 2 *
      node.velocity ** 2
  }
  return energy
}

function accelerateGear({
  root,
  acceleration,
  elapsed,
  world,
}: {
  root: Gear
  acceleration: number
  elapsed: number
  world: World
}): void {
  root.velocity += acceleration * elapsed
  for (const { gear, sign } of iterateNetwork(
    root,
    world.gears,
  )) {
    gear.velocity =
      sign *
      Math.abs(root.velocity) *
      (root.radius / gear.radius)
  }
}

function applyFriction({
  network,
  elapsed,
}: {
  network: Network
  elapsed: number
}): void {
  let energy = getEnergy(network)
  energy -= energy * FRICTION * elapsed

  const [root] = [...network]
  invariant(root)

  let sum = 0
  for (const node of network) {
    sum += (1 / 4) * node.mass * root.radius ** 2
  }
  root.velocity =
    Math.sign(root.velocity) * Math.sqrt(energy / sum)

  for (const node of network) {
    node.velocity =
      Math.sign(node.velocity) *
      (root.radius / node.radius) *
      Math.abs(root.velocity)
  }
}

const initSimulator: InitSimulatorFn = ({
  pointer,
  world,
  signal,
}) => {
  let prev: number = performance.now()
  function tick() {
    const now = performance.now()

    // cap the tick at 2x the duration
    // elapsed will likely be > TICK_DURATION because
    // of setInterval accuracy
    //
    if (now - prev > TICK_DURATION * 2) {
      prev = now - TICK_DURATION * 2
    }

    const elapsed = (now - prev) / 1000
    prev = now

    if (
      pointer.current.type === PointerType.ApplyForce &&
      pointer.current.state?.active &&
      pointer.current.state.gearId
    ) {
      const gear = world.gears[pointer.current.state.gearId]
      invariant(gear)
      accelerateGear({
        root: gear,
        acceleration:
          pointer.current.acceleration * ACCELERATION,
        elapsed,
        world,
      })
    }

    const networks = getNetworks(world.gears)
    for (const network of networks) {
      applyFriction({ network, elapsed })
    }

    for (const gear of Object.values(world.gears)) {
      gear.angle += gear.velocity * elapsed
    }
  }
  const interval = self.setInterval(tick, TICK_DURATION)

  signal.addEventListener('abort', () => {
    self.clearInterval(interval)
  })
}

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

const initCanvas: InitCanvasFn = ({
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

    let grid = {
      tl: {
        x:
          Math.floor(-canvas.width / 2 / TILE_SIZE) *
          TILE_SIZE,
        y:
          Math.floor(-canvas.height / 2 / TILE_SIZE) *
          TILE_SIZE,
      },
      br: {
        x:
          Math.ceil(canvas.width / 2 / TILE_SIZE) *
          TILE_SIZE,
        y:
          Math.ceil(canvas.height / 2 / TILE_SIZE) *
          TILE_SIZE,
      },
    }

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = 'hsl(0, 0%, 10%)'
    for (let y = grid.tl.y; y < grid.br.y; y += TILE_SIZE) {
      context.moveTo(grid.tl.x, y)
      context.lineTo(grid.br.x, y)
    }
    for (let x = grid.tl.x; x < grid.br.x; x += TILE_SIZE) {
      context.moveTo(x, grid.tl.y)
      context.lineTo(x, grid.br.y)
    }
    context.stroke()
    context.closePath()

    function renderGear(
      gear: Pick<
        Gear,
        'radius' | 'position' | 'angle' | 'connections'
      >,
      tint?: string,
    ): void {
      invariant(context)

      context.save()
      context.translate(
        (gear.position.x - (gear.radius - 0.5)) * TILE_SIZE,
        (gear.position.y - (gear.radius - 0.5)) * TILE_SIZE,
      )

      if (DRAW_GEAR_BOX) {
        context.fillStyle = 'grey'
        context.fillRect(
          0,
          0,
          TILE_SIZE * gear.radius * 2,
          TILE_SIZE * gear.radius * 2,
        )
      }

      context.strokeStyle = 'white'
      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.closePath()

      context.save()
      context.translate(
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
      )
      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = 'white'
      const teeth = gear.radius * 10
      for (let i = 0; i < teeth; i++) {
        context.save()
        context.rotate(
          gear.angle + (i / teeth) * Math.PI * 2,
        )
        context.moveTo((gear.radius - 0.25) * TILE_SIZE, 0)
        context.lineTo(gear.radius * TILE_SIZE, 0)
        context.stroke()
        context.restore()
      }
      context.closePath()
      context.restore()

      if (tint) {
        context.fillStyle = tint
        context.fillRect(
          0,
          0,
          TILE_SIZE * gear.radius * 2,
          TILE_SIZE * gear.radius * 2,
        )
      }

      context.restore()

      for (const connection of gear.connections) {
        const peer = world.gears[connection.gearId]
        invariant(peer)

        if (connection.type === ConnectionType.Chain) {
          context.beginPath()
          context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
          context.lineWidth = 2
          context.strokeRect(
            Math.min(peer.position.x, gear.position.x) *
              TILE_SIZE,
            Math.min(peer.position.y, gear.position.y) *
              TILE_SIZE,
            (Math.abs(peer.position.x - gear.position.x) +
              1) *
              TILE_SIZE,
            (Math.abs(peer.position.y - gear.position.y) +
              1) *
              TILE_SIZE,
          )
          context.closePath()
        } else {
          context.beginPath()
          context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
          context.lineWidth = 2
          context.moveTo(
            (gear.position.x + 0.5) * TILE_SIZE,
            (gear.position.y + 0.5) * TILE_SIZE,
          )
          context.lineTo(
            (peer.position.x + 0.5) * TILE_SIZE,
            (peer.position.y + 0.5) * TILE_SIZE,
          )
          context.stroke()
          context.closePath()
        }
      }
    }

    for (const gear of Object.values(world.gears)) {
      renderGear(gear)
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
        renderGear(
          {
            position: state.position,
            radius: size / 2,
            angle: 0,
            connections: state.connections,
          },
          state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
        )
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
        renderGear(
          {
            position: state.position,
            radius: 0.5,
            angle: 0,
            connections: [], // TODO
          },
          state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
        )

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
