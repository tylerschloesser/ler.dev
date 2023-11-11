import { initRoot } from './init-root.js'
import { InitCanvasFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'
import invariant from 'tiny-invariant'

const initCanvas: InitCanvasFn = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)
  context.fillStyle = 'grey'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'black'
  context.arc(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) / 4,
    0,
    Math.PI * 2,
  )
  context.fill()
}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas className={styles.canvas} ref={setCanvas} />
}

initRoot(<DemoGear />)
