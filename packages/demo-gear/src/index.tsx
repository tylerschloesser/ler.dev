import { initRoot } from './init-root.js'
import { InitCanvasFn, InitPointerFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'
import invariant from 'tiny-invariant'

const TILE_SIZE = 50

interface Pointer {
  x: number
  y: number
}

let pointer: Pointer | null = null

const initPointer: InitPointerFn = (canvas) => {
  canvas.addEventListener('pointermove', (e) => {
    pointer = { x: e.clientX, y: e.clientY }
  })
  canvas.addEventListener('pointerleave', () => {
    pointer = null
  })
}

const initCanvas: InitCanvasFn = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  initPointer(canvas)

  const size = {
    x: Math.floor(canvas.width / TILE_SIZE),
    y: Math.floor(canvas.height / TILE_SIZE),
  }

  const offset = {
    x: (canvas.width / TILE_SIZE - size.x) / 2,
    y: (canvas.height / TILE_SIZE - size.y) / 2,
  }

  function render() {
    invariant(context)

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
    context.strokeStyle = 'white'

    for (let y = 0; y < size.y + 1; y++) {
      context.moveTo(offset.x * TILE_SIZE, (offset.y + y) * TILE_SIZE)
      context.lineTo(
        canvas.width - offset.x * TILE_SIZE,
        (offset.y + y) * TILE_SIZE,
      )
    }
    for (let x = 0; x < size.x + 1; x++) {
      context.moveTo((offset.x + x) * TILE_SIZE, offset.y * TILE_SIZE)
      context.lineTo(
        (offset.x + x) * TILE_SIZE,
        canvas.height - offset.y * TILE_SIZE,
      )
    }
    context.stroke()

    if (pointer) {
      context.fillStyle = 'white'
      const radius = Math.min(canvas.width, canvas.height) * 0.1
      context.beginPath()
      context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2)
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
