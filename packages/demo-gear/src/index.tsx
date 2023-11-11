import { initRoot } from './init-root.js'
import { InitCanvasFn, InitPointerFn, Vec2, initKeyboardFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'
import invariant from 'tiny-invariant'

const TILE_SIZE = 30

interface Pointer {
  position: Vec2
  valid: boolean
}

let pointer: Pointer | null = null

const GEAR_SIZES = [1, 3, 5, 7]
let gearSizeIndex: number = 0

interface Gear {
  id: string
  position: Vec2
  size: number
}

const gears: Record<string, Gear> = {}

interface Tile {
  gearId: string
}

const tiles: Record<string, Tile> = {}

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
    return { position, valid: true }
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
      const { position } = pointer
      invariant(position.x === Math.floor(position.x))
      invariant(position.y === Math.floor(position.y))

      const gearSize = GEAR_SIZES[gearSizeIndex]
      invariant(gearSize !== undefined)

      const gearId = `${position.x}.${position.y}`
      invariant(gears[gearId] === undefined)

      const gear: Gear = {
        id: gearId,
        position: {
          x: position.x,
          y: position.y,
        },
        size: gearSize,
      }

      gears[gear.id] = gear

      for (let x = -((gearSize - 1) / 2); x <= (gearSize - 1) / 2; x++) {
        for (let y = -((gearSize - 1) / 2); y <= (gearSize - 1) / 2; y++) {
          invariant(x === Math.floor(x))
          invariant(y === Math.floor(y))

          const tileId = `${position.x + x}.${position.y + y}`
          invariant(tiles[tileId] === undefined)

          tiles[tileId] = { gearId }
        }
      }
      console.log(tiles)
    }
    pointer = null
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

  function render() {
    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
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

    function renderGear(gear: Omit<Gear, 'id'>, tint?: string): void {
      invariant(context)
      context.fillStyle = 'grey'
      context.fillRect(
        (gear.position.x - (gear.size - 1) / 2) * TILE_SIZE,
        (gear.position.y - (gear.size - 1) / 2) * TILE_SIZE,
        TILE_SIZE * gear.size,
        TILE_SIZE * gear.size,
      )

      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        (gear.position.x + 0.5) * TILE_SIZE,
        (gear.position.y + 0.5) * TILE_SIZE,
        (TILE_SIZE * gear.size) / 2,
        0,
        Math.PI * 2,
      )
      context.fill()

      if (tint) {
        context.fillStyle = tint
        context.fillRect(
          (gear.position.x - (gear.size - 1) / 2) * TILE_SIZE,
          (gear.position.y - (gear.size - 1) / 2) * TILE_SIZE,
          TILE_SIZE * gear.size,
          TILE_SIZE * gear.size,
        )
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
