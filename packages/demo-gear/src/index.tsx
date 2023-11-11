import { initRoot } from './init-root.js'
import { InitCanvasFn, InitPointerFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'
import invariant from 'tiny-invariant'

interface Pointer {
  x: number
  y: number
}

let pointer: Pointer | null = null

const initPointer: InitPointerFn = (canvas) => {
  addEventListener('pointermove', (e) => {
    pointer = { x: e.clientX, y: e.clientY }
  })
}

const initCanvas: InitCanvasFn = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  initPointer(canvas)

  function render() {
    invariant(context)

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

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
