import { initRoot } from './init-root.js'
import { InitCanvasFn, InitPointerFn, Vec2, initKeyboardFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import invariant from 'tiny-invariant'
import styles from './index.module.scss'

const TILE_SIZE = 30

interface Pointer {
  position: Vec2
  valid: boolean
  connections: Set<string>
}

let pointer: Pointer | null = null

const GEAR_SIZES = [1, 3, 5, 7]
let gearSizeIndex: number = 0

interface Gear {
  id: string
  position: Vec2
  size: number
  angle: number
  velocity: number
  connections: Set<string>
}

const gears: Record<string, Gear> = {}

interface Tile {
  gearId: string
}

const tiles: Record<string, Tile> = {}

function initSimulator() {
  let prev: number = performance.now()
  function tick() {
    const now = performance.now()
    const elapsed = (now - prev) / 1000
    prev = now

    for (const gear of Object.values(gears)) {
      gear.angle += gear.velocity * elapsed
    }
  }
  self.setInterval(tick, 100)
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

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    size,
    angle: 0,
    velocity: Math.PI / 2,
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

function getPointer({
  e,
  offset,
  size,
}: {
  e: PointerEvent
  size: Vec2
  offset: Vec2
}): Pointer | null {
  const position = {
    x: Math.floor((e.clientX - offset.x) / TILE_SIZE),
    y: Math.floor((e.clientY - offset.y) / TILE_SIZE),
  }
  if (
    position.x >= 0 &&
    position.x < size.x &&
    position.y >= 0 &&
    position.y < size.y
  ) {
    const gearSize = GEAR_SIZES[gearSizeIndex]
    invariant(gearSize !== undefined)

    let valid = true
    for (let x = -((gearSize - 1) / 2); x <= (gearSize - 1) / 2 && valid; x++) {
      for (
        let y = -((gearSize - 1) / 2);
        y <= (gearSize - 1) / 2 && valid;
        y++
      ) {
        invariant(x === Math.floor(x))
        invariant(y === Math.floor(y))

        if (
          !(
            position.x + x >= 0 &&
            position.x + x < size.x &&
            position.y + y >= 0 &&
            position.y + y < size.y
          )
        ) {
          valid = false
        }
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

    return { position, valid, connections }
  } else {
    return null
  }
}

const initPointer: InitPointerFn = ({ canvas, size, offset }) => {
  canvas.addEventListener('pointermove', (e) => {
    pointer = getPointer({ e, offset, size })
  })
  canvas.addEventListener('pointerleave', () => {
    pointer = null
  })
  canvas.addEventListener('pointerup', (e) => {
    pointer = getPointer({ e, offset, size })
    if (pointer && pointer.valid) {
      const gearSize = GEAR_SIZES[gearSizeIndex]
      invariant(gearSize !== undefined)
      addGear({ position: pointer.position, size: gearSize })
    }
  })
}

const initKeyboard: initKeyboardFn = () => {
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
      gearSizeIndex = Math.min(GEAR_SIZES.length - 1, gearSizeIndex + 1)
    } else if (e.key === 'ArrowDown') {
      gearSizeIndex = Math.max(0, gearSizeIndex - 1)
    }
  })
}

const initCanvas: InitCanvasFn = (canvas) => {
  console.log('initializing canvas')
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  const size = {
    x: Math.floor(canvas.width / TILE_SIZE),
    y: Math.floor(canvas.height / TILE_SIZE),
  }

  const offset = {
    x: ((canvas.width / TILE_SIZE - size.x) / 2) * TILE_SIZE,
    y: ((canvas.height / TILE_SIZE - size.y) / 2) * TILE_SIZE,
  }

  initPointer({ canvas, size, offset })
  initKeyboard({ canvas })
  initSimulator()

  addGear({
    position: {
      x: Math.floor(size.x / 2),
      y: Math.floor(size.y / 2),
    },
    size: GEAR_SIZES[1]!,
  })

  function render() {
    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = 'grey'

    context.translate(offset.x, offset.y)

    for (let y = 0; y < size.y + 1; y++) {
      context.moveTo(0, y * TILE_SIZE)
      context.lineTo(size.x * TILE_SIZE, y * TILE_SIZE)
    }
    for (let x = 0; x < size.x + 1; x++) {
      context.moveTo(x * TILE_SIZE, 0)
      context.lineTo(x * TILE_SIZE, size.y * TILE_SIZE)
    }
    context.stroke()
    context.closePath()

    function renderGear(
      gear: Omit<Gear, 'id' | 'velocity'>,
      tint?: string,
    ): void {
      invariant(context)

      context.save()
      context.translate(
        (gear.position.x - (gear.size - 1) / 2) * TILE_SIZE,
        (gear.position.y - (gear.size - 1) / 2) * TILE_SIZE,
      )

      context.fillStyle = 'grey'
      context.fillRect(0, 0, TILE_SIZE * gear.size, TILE_SIZE * gear.size)

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
      context.rotate(gear.angle)
      context.moveTo(0, 0)
      context.lineTo((gear.size * TILE_SIZE) / 2, 0)
      context.stroke()
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
        context.strokeStyle = 'red'
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

    if (pointer) {
      const gearSize = GEAR_SIZES[gearSizeIndex]
      invariant(gearSize !== undefined)
      renderGear(
        {
          position: pointer.position,
          size: gearSize,
          angle: 0,
          connections: pointer.connections,
        },
        pointer.valid ? `hsla(120, 50%, 50%, .5)` : `hsla(240, 50%, 50%, .5)`,
      )
    }

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas className={styles.canvas} ref={setCanvas} />
}

initRoot(<DemoGear />)
