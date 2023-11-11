import { initRoot } from './init-root.js'
import { InitCanvasFn } from './types.js'
import { useCanvas } from './use-canvas.js'

const initCanvas: InitCanvasFn = () => {}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas ref={setCanvas} />
}

initRoot(<DemoGear />)
