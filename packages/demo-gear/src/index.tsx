import { initRoot } from './init-root.js'
import {
  GEAR_SIZES,
  Gear,
  InitCanvasFn,
  InitPointerFn,
  InputState,
  PointerMode,
  Vec2,
  initKeyboardFn,
} from './types.js'

import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import styles from './index.module.scss'
import { useInputState } from './state.js'
import { Toolbar } from './toolbar.js'

const TILE_SIZE = 40

const TICK_DURATION = 50
const DRAW_GEAR_BOX = false

interface BasePointer {
  position: Vec2
}

interface AddGearPointer extends BasePointer {
  mode: PointerMode.AddGear
  valid: boolean
  connections: Set<string>
}

interface ApplyForcePointer extends BasePointer {
  mode: PointerMode.ApplyForce
  active: boolean
  gearId?: string
}

type Pointer = AddGearPointer | ApplyForcePointer

let pointer: Pointer | null = null

const gears: Record<string, Gear> = {}

interface Tile {
  gearId: string
}

const tiles: Record<string, Tile> = {}

function propogateVelocity({
  gear,
  seen,
}: {
  gear: Gear
  seen: Set<string>
}): void {
  for (const peerId of gear.connections) {
    if (seen.has(peerId)) {
      continue
    }
    seen.add(peerId)

    const peer = gears[peerId]
    invariant(peer)

    const ratio = gear.size / peer.size
    peer.velocity = gear.velocity * -1 * ratio

    propogateVelocity({
      gear: peer,
      seen,
    })
  }
}

function accelerateGear({
  gear,
  acceleration,
  elapsed,
}: {
  gear: Gear
  acceleration: number
  elapsed: number
}): void {
  gear.velocity += acceleration * elapsed

  propogateVelocity({
    gear,
    seen: new Set<string>(),
  })
}

function initSimulator({
  inputState,
}: {
  inputState: React.MutableRefObject<InputState>
}) {
  let prev: number = performance.now()
  function tick() {
    const now = performance.now()
    const elapsed = (now - prev) / 1000
    prev = now
    for (const gear of Object.values(gears)) {
      if (
        pointer?.mode === PointerMode.ApplyForce &&
        pointer.gearId === gear.id &&
        pointer.active
      ) {
        accelerateGear({
          gear,
          acceleration: inputState.current.acceleration,
          elapsed,
        })
      }
      gear.angle += gear.velocity * elapsed
    }
  }
  self.setInterval(tick, TICK_DURATION)
}

function addGear({ size, position }: { size: number; position: Vec2 }): void {
  invariant(position.x === Math.floor(position.x))
  invariant(position.y === Math.floor(position.y))

  const gearId = `${position.x}.${position.y}`
  invariant(gears[gearId] === undefined)

  const connections = getConnections({
    gearSize: size,
    position,
  })
  connections.forEach((peerId) => {
    const peer = gears[peerId]
    invariant(peer)
    peer.connections.add(gearId)
  })

  let velocity = Math.PI / 4

  invariant(connections.size < 2)
  if (connections.size === 1) {
    const peerId = [...connections].at(0)
    invariant(peerId !== undefined)
    const peer = gears[peerId]
    invariant(peer)

    const ratio = peer.size / size
    velocity = peer.velocity * -1 * ratio
  }

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    size,
    mass: Math.PI * size ** 2,
    angle: 0,
    velocity,
    connections,
  }

  gears[gear.id] = gear

  for (let x = -((size - 1) / 2); x <= (size - 1) / 2; x++) {
    for (let y = -((size - 1) / 2); y <= (size - 1) / 2; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))

      const tileId = `${position.x + x}.${position.y + y}`
      invariant(tiles[tileId] === undefined)

      tiles[tileId] = { gearId }
    }
  }
}

function getConnections({
  gearSize,
  position,
}: {
  gearSize: number
  position: Vec2
}): Set<string> {
  const connections = new Set<string>()

  for (const delta of [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ]) {
    const point = {
      x: position.x + ((gearSize - 1) / 2 + 1) * delta.x,
      y: position.y + ((gearSize - 1) / 2 + 1) * delta.y,
    }
    const tileId = `${point.x}.${point.y}`
    const tile = tiles[tileId]
    if (!tile) {
      continue
    }
    const gear = gears[tile.gearId]
    invariant(gear)

    if (
      gear.position.x + -(((gear.size - 1) / 2) * delta.x) === point.x &&
      gear.position.y + -(((gear.size - 1) / 2) * delta.y) === point.y
    ) {
      connections.add(tile.gearId)
    }
  }
  return connections
}

type GetPointerFn<T extends Pointer> = (args: {
  e: PointerEvent
  canvas: HTMLCanvasElement
  inputState: React.MutableRefObject<InputState>
}) => T

const getApplyForcePointer: GetPointerFn<ApplyForcePointer> = ({
  e,
  canvas,
}) => {
  const position = {
    x: Math.floor((e.offsetX - canvas.width / 2) / TILE_SIZE),
    y: Math.floor((e.offsetY - canvas.height / 2) / TILE_SIZE),
  }

  const tileId = `${position.x}.${position.y}`
  const tile = tiles[tileId]

  const gearId = tile?.gearId

  const active = Boolean(e.buttons)

  return { mode: PointerMode.ApplyForce, position, gearId, active }
}

const getAddGearPointer: GetPointerFn<AddGearPointer> = ({
  e,
  canvas,
  inputState,
}) => {
  const { gearSize } = inputState.current

  const position = {
    x: Math.floor((e.offsetX - canvas.width / 2) / TILE_SIZE),
    y: Math.floor((e.offsetY - canvas.height / 2) / TILE_SIZE),
  }

  let valid = true
  for (let x = -((gearSize - 1) / 2); x <= (gearSize - 1) / 2 && valid; x++) {
    for (let y = -((gearSize - 1) / 2); y <= (gearSize - 1) / 2 && valid; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))

      const tileId = `${position.x + x}.${position.y + y}`
      if (tiles[tileId]) {
        valid = false
      }
    }
  }

  let connections = new Set<string>()
  if (valid) {
    connections = getConnections({ position, gearSize })
  }

  return { mode: PointerMode.AddGear, position, valid, connections }
}

const initPointer: InitPointerFn = ({ canvas, inputState }) => {
  canvas.addEventListener('pointermove', (e) => {
    switch (inputState.current.pointerMode) {
      case PointerMode.AddGear: {
        pointer = getAddGearPointer({ e, canvas, inputState })
        break
      }
      case PointerMode.ApplyForce: {
        pointer = getApplyForcePointer({ e, canvas, inputState })
        break
      }
    }
  })
  canvas.addEventListener('pointerleave', () => {
    pointer = null
  })
  canvas.addEventListener('pointerup', (e) => {
    switch (inputState.current.pointerMode) {
      case PointerMode.AddGear: {
        pointer = getAddGearPointer({ e, canvas, inputState })
        if (pointer.valid) {
          const { gearSize } = inputState.current
          addGear({ position: pointer.position, size: gearSize })
        }
        break
      }
      case PointerMode.ApplyForce: {
        pointer = getApplyForcePointer({ e, canvas, inputState })
        break
      }
    }
  })
  canvas.addEventListener('pointerdown', (e) => {
    switch (inputState.current.pointerMode) {
      case PointerMode.ApplyForce: {
        pointer = getApplyForcePointer({ e, canvas, inputState })
        break
      }
    }
  })
}

const initKeyboard: initKeyboardFn = () => {}

const initCanvas: InitCanvasFn = ({ canvas, inputState }) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  initPointer({ canvas, inputState })
  initKeyboard({ canvas })
  initSimulator({ inputState })

  addGear({
    position: {
      x: 0,
      y: 0,
    },
    size: GEAR_SIZES[1]!,
  })

  function render() {
    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.translate(canvas.width / 2, canvas.height / 2)

    let grid = {
      tl: {
        x: Math.floor(-canvas.width / 2 / TILE_SIZE) * TILE_SIZE,
        y: Math.floor(-canvas.height / 2 / TILE_SIZE) * TILE_SIZE,
      },
      br: {
        x: Math.ceil(canvas.width / 2 / TILE_SIZE) * TILE_SIZE,
        y: Math.ceil(canvas.height / 2 / TILE_SIZE) * TILE_SIZE,
      },
    }

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = 'grey'
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
      gear: Pick<Gear, 'size' | 'position' | 'angle' | 'connections'>,
      tint?: string,
    ): void {
      invariant(context)

      context.save()
      context.translate(
        (gear.position.x - (gear.size - 1) / 2) * TILE_SIZE,
        (gear.position.y - (gear.size - 1) / 2) * TILE_SIZE,
      )

      if (DRAW_GEAR_BOX) {
        context.fillStyle = 'grey'
        context.fillRect(0, 0, TILE_SIZE * gear.size, TILE_SIZE * gear.size)
      }

      context.strokeStyle = 'white'
      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        (gear.size * TILE_SIZE) / 2,
        (gear.size * TILE_SIZE) / 2,
        (TILE_SIZE * gear.size) / 2,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.closePath()

      context.save()
      context.translate(
        (gear.size * TILE_SIZE) / 2,
        (gear.size * TILE_SIZE) / 2,
      )
      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = 'white'
      const teeth = gear.size * 5
      for (let i = 0; i < teeth; i++) {
        context.save()
        context.rotate(gear.angle + (i / teeth) * Math.PI * 2)
        context.moveTo(((gear.size - 0.5) * TILE_SIZE) / 2, 0)
        context.lineTo((gear.size * TILE_SIZE) / 2, 0)
        context.stroke()
        context.restore()
      }
      context.closePath()
      context.restore()

      if (tint) {
        context.fillStyle = tint
        context.fillRect(0, 0, TILE_SIZE * gear.size, TILE_SIZE * gear.size)
      }

      context.restore()

      for (const connection of gear.connections) {
        const peer = gears[connection]
        invariant(peer)
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

    for (const gear of Object.values(gears)) {
      renderGear(gear)
    }

    if (pointer?.mode === PointerMode.AddGear) {
      const { gearSize } = inputState.current
      renderGear(
        {
          position: pointer.position,
          size: gearSize,
          angle: 0,
          connections: pointer.connections,
        },
        pointer.valid ? `hsla(120, 50%, 50%, .5)` : `hsla(0, 50%, 50%, .5)`,
      )
    }

    if (pointer?.mode === PointerMode.ApplyForce && pointer.gearId) {
      const gear = gears[pointer.gearId]
      invariant(gear)

      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = pointer.active ? 'green' : 'white'
      context.strokeRect(
        (gear.position.x - (gear.size - 1) / 2) * TILE_SIZE,
        (gear.position.y - (gear.size - 1) / 2) * TILE_SIZE,
        TILE_SIZE * gear.size,
        TILE_SIZE * gear.size,
      )
      context.closePath()
    }

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}

function DemoGear() {
  const { inputState } = useInputState()
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (canvas) {
      initCanvas({ canvas, inputState })
    }
  }, [canvas])
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar />
      </div>
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}

initRoot(<DemoGear />)
