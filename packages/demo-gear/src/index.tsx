import { initRoot } from './init-root.js'
import { InitCanvasFn } from './types.js'
import { useCanvas } from './use-canvas.js'

const initCanvas: InitCanvasFn = (canvas) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas ref={setCanvas} />
}

initRoot(<DemoGear />)
