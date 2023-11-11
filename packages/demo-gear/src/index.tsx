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
  console.log(offset)

  initPointer({ canvas, size, offset })

  function render() {
    invariant(context)

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
    context.strokeStyle = 'white'

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
      context.fillStyle = 'white'
      context.fillRect(
        Math.floor(pointer.x) * TILE_SIZE,
        Math.floor(pointer.y) * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      )

      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        (Math.floor(pointer.x) + 0.5) * TILE_SIZE,
        (Math.floor(pointer.y) + 0.5) * TILE_SIZE,
        TILE_SIZE / 2,
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
