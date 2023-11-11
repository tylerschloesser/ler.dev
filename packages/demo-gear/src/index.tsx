import { initRoot } from './init-root.js'
import { InitCanvasFn } from './types.js'
import { useCanvas } from './use-canvas.js'

import styles from './index.module.scss'

const initCanvas: InitCanvasFn = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas className={styles.canvas} ref={setCanvas} />
}

initRoot(<DemoGear />)
