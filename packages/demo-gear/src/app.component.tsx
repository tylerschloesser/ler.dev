import { useEffect, useState } from 'react'
import styles from './app.module.scss'
import { moveCamera } from './camera.js'
import { Canvas } from './canvas.component.js'
import { initCanvas } from './init-canvas.js'
import { initKeyboard } from './init-keyboard.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { initWheel } from './init-wheel.js'
import { Toolbar as HoverToolbar } from './toolbar.js'
import { TouchToolbar } from './touch-toolbar.component.js'
import { AppState, InitFn } from './types.js'
import { useMediaQuery } from './use-media-query.js'
import { useWorld } from './use-world.js'
import {useTextures} from './textures.js'

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
  const textures = useTextures()
  useEffect(() => {
    if (!canvas || !world || !textures) {
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
      camera: {
        position: { x: 0, y: 0 },
        zoom: 0.5,
      },
      hand: null,
      tileSize: 0,
      pointerListeners: new Set([moveCamera]),
      cameraListeners: new Set(),
      textures,
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

  const hover = useMediaQuery('(hover: hover)')

  const Toolbar = hover ? HoverToolbar : TouchToolbar

  return (
    <div className={styles.container}>
      {state && <Toolbar state={state} />}
      <div className={styles.canvas}>
        <Canvas setCanvas={setCanvas} />
      </div>
    </div>
  )
}
