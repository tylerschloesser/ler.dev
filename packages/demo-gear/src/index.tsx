import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { GEAR_RADIUSES } from './const.js'
import styles from './index.module.scss'
import { initCanvas } from './init-canvas.js'
import { initKeyboard } from './init-keyboard.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { Toolbar } from './toolbar.js'
import { Pointer, PointerType, World } from './types.js'
import { useWorld } from './use-world.js'

export function DemoGear() {
  const pointer = useRef<Pointer>({
    type: PointerType.AddGear,
    radius: GEAR_RADIUSES[0]!,
    state: null,
  })
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)

  const { world, save, reset } = useWorld()
  useInit({ canvas, pointer, world })

  if (!world) {
    return <>Loading...</>
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar
          pointer={pointer}
          world={world}
          save={save}
          reset={reset}
        />
      </div>
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}

function useInit({
  canvas,
  world,
  pointer,
}: {
  canvas: HTMLCanvasElement | null
  world: World | null
  pointer: React.MutableRefObject<Pointer>
}) {
  useEffect(() => {
    if (canvas && world) {
      const controller = new AbortController()
      const { signal } = controller
      initCanvas({
        canvas,
        pointer,
        signal,
        world,
      })
      initPointer({
        canvas,
        pointer,
        signal,
        world,
      })
      initKeyboard({ canvas, pointer, signal })
      initSimulator({
        pointer,
        world,
        signal,
      })
      return () => {
        controller.abort()
      }
    }
  }, [canvas, world])
}
