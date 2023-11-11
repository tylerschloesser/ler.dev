import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { InitCanvasFn } from './types.js'
import { useCanvas } from './use-canvas.js'

const initCanvas: InitCanvasFn = () => {}

const DemoGear = () => {
  const setCanvas = useCanvas(initCanvas)
  return <canvas ref={setCanvas} />
}

const container = document.getElementById('app')
invariant(container)
const root = createRoot(container)
root.render(<DemoGear />)
