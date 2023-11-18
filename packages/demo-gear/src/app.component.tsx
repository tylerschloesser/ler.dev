import { useEffect, useState } from 'react'
import styles from './app.module.scss'
import { initCanvas } from './init-canvas.js'
import { initKeyboard } from './init-keyboard.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { Toolbar } from './toolbar.js'
import { AppState, InitFn, PointerMode } from './types.js'
import { useMediaQuery } from './use-media-query.js'
import { useWorld } from './use-world.js'

const INIT_FNS: InitFn[] = [
  initCanvas,
  initPointer,
  initKeyboard,
  initSimulator,
]

interface UseAppStateArgs {
  canvas: HTMLCanvasElement | null
  controller: AbortController
}

function useAppState({
  canvas,
  controller,
}: UseAppStateArgs): AppState | null {
  const [state, setState] = useState<AppState | null>(null)
  const [world, setWorld] = useWorld()
  useEffect(() => {
    if (!canvas || !world) {
      return
    }
    setState({
      canvas,
      world,
      setWorld,
      signal: controller.signal,
      pointer: {
        active: false,
        down: false,
        mode: PointerMode.Free,
        position: { x: 0, y: 0 },
      },
      camera: {
        position: { x: 0, y: 0 },
        zoom: 0.5,
      },
      build: null,
      accelerate: null,
    })
    return () => {
      controller.abort()
    }
  }, [canvas, world, controller])

  return state
}

export function App() {
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)
  const [controller] = useState(new AbortController())
  const { signal } = controller

  const state = useAppState({ canvas, controller })

  useEffect(() => {
    if (!state) {
      return
    }
    for (const init of INIT_FNS) {
      init(state)
    }
    return () => {
      controller.abort()
    }
  }, [state, controller])

  const hover = useMediaQuery('(hover: hover)', signal)

  return (
    <div className={styles.container}>
      {state && hover && (
        <div className={styles.toolbar}>
          <Toolbar state={state} />
        </div>
      )}
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}
