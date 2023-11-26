import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './app.module.scss'
import { moveCamera } from './camera.js'
import { Canvas } from './canvas.component.js'
import { AppContext } from './context.js'
import { initCanvas } from './init-canvas.js'
import { initKeyboard } from './init-keyboard.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { initWheel } from './init-wheel.js'
import { AppState, InitFn } from './types.js'
import { useCamera } from './use-camera.js'
import { useWorld } from './use-world.js'

const INIT_FNS: InitFn[] = [
  initCanvas,
  initPointer,
  initWheel,
  initKeyboard,
  initSimulator,
]

function useAppState(
  canvas: {
    container: HTMLDivElement
    cpu: HTMLCanvasElement
    gpu: HTMLCanvasElement
  } | null,
): AppState | null {
  const [state, setState] = useState<AppState | null>(null)
  const [world, setWorld] = useWorld()
  const { camera, saveCamera } = useCamera()
  useEffect(() => {
    if (!canvas || !world) {
      return
    }
    const controller = new AbortController()
    setState({
      canvas,
      viewport: {
        size: { x: 0, y: 0 },
        pixelRatio: window.devicePixelRatio,
      },
      world,
      setWorld,
      signal: controller.signal,
      camera,
      hand: null,
      tileSize: 0,
      pointerListeners: new Set([moveCamera]),
      cameraListeners: new Set([
        (state) => saveCamera(state.camera),
      ]),
    })
    return () => {
      controller.abort()
    }
  }, [canvas, world])

  return state
}

export function App() {
  const [canvas, setCanvas] = useState<{
    container: HTMLDivElement
    cpu: HTMLCanvasElement
    gpu: HTMLCanvasElement
  } | null>(null)
  const state = useAppState(canvas)

  useEffect(() => {
    if (!state) {
      return
    }
    for (const init of INIT_FNS) {
      init(state)
    }
  }, [state])

  // const hover = useMediaQuery('(hover: hover)')

  return (
    <AppContext.Provider value={state}>
      <div className={styles.container}>
        <div className={styles.canvas}>
          <Canvas setCanvas={setCanvas} />
        </div>
        <Outlet />
      </div>
    </AppContext.Provider>
  )
}
