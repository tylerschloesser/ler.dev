import { useEffect, useRef, useState } from 'react'
import styles from './app.module.scss'
import { GEAR_RADIUSES } from './const.js'
import { initCanvas } from './init-canvas.js'
import { initKeyboard } from './init-keyboard.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { Toolbar } from './toolbar.js'
import {
  InitArgs,
  InitFn,
  Pointer,
  PointerType,
} from './types.js'
import { useMediaQuery } from './use-media-query.js'
import { useWorld } from './use-world.js'

const INIT_FNS: InitFn[] = [
  initCanvas,
  initPointer,
  initKeyboard,
  initSimulator,
]

export function App() {
  const pointer = useRef<Pointer>({
    type: PointerType.AddGear,
    radius: GEAR_RADIUSES[0]!,
    state: null,
  })
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)
  const { world, save, reset } = useWorld()
  const [controller] = useState(new AbortController())
  const { signal } = controller

  useEffect(() => {
    if (canvas && world) {
      const args: InitArgs = {
        canvas,
        pointer,
        world,
        signal,
      }
      for (const init of INIT_FNS) {
        init(args)
      }
    }
  }, [canvas, pointer, world, signal])

  useEffect(() => {
    return () => {
      controller.abort()
    }
  }, [])

  const hover = useMediaQuery('(hover: hover)', signal)

  if (!world) {
    return <>Loading...</>
  }

  return (
    <div className={styles.container}>
      {hover && (
        <div className={styles.toolbar}>
          <Toolbar
            pointer={pointer}
            world={world}
            save={save}
            reset={reset}
          />
        </div>
      )}
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}
