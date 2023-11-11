import { initRoot } from './init-root.js'
import { InitCanvasFn, InitPointerFn, initKeyboardFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'
import invariant from 'tiny-invariant'

const TILE_SIZE = 30

interface Pointer {
  x: number
  y: number
}

let pointer: Pointer | null = null

const GEAR_SIZES = [1, 3, 5, 7]
let gearSizeIndex: number = 0

const initPointer: InitPointerFn = ({ canvas, size, offset }) => {
  canvas.addEventListener('pointermove', (e) => {
    const p = {
      x: Math.floor((e.clientX - offset.x) / TILE_SIZE),
      y: Math.floor((e.clientY - offset.y) / TILE_SIZE),
    }
    if (p.x >= 0 && p.x < size.x && p.y >= 0 && p.y < size.y) {
      pointer = p
    } else {
      pointer = null
    }
  })
  canvas.addEventListener('pointerleave', () => {
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

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
    context.strokeStyle = 'grey'

    context.resetTransform()
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

    if (pointer) {
      const gearSize = GEAR_SIZES[gearSizeIndex]
      invariant(gearSize !== undefined)

      context.fillStyle = 'grey'
      context.fillRect(
        (Math.floor(pointer.x) - (gearSize - 1) / 2) * TILE_SIZE,
        (Math.floor(pointer.y) - (gearSize - 1) / 2) * TILE_SIZE,
        TILE_SIZE * gearSize,
        TILE_SIZE * gearSize,
      )

      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        (Math.floor(pointer.x) + 0.5) * TILE_SIZE,
        (Math.floor(pointer.y) + 0.5) * TILE_SIZE,
        (TILE_SIZE * gearSize) / 2,
        0,
        Math.PI * 2,
      )
      context.fill()
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
