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

  const world = useWorld()

  useInit({ canvas, pointer, world })

  const save = useCallback(() => {
    localStorage.setItem(
      'world',
      JSON.stringify(world.current),
    )
  }, [world])

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar
          pointer={pointer}
          save={save}
          world={world}
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
  world: React.MutableRefObject<World>
  pointer: React.MutableRefObject<Pointer>
}) {
  useEffect(() => {
    if (canvas) {
      const controller = new AbortController()
      const { signal } = controller
      initCanvas({
        canvas,
        pointer,
        signal,
        world: world.current,
      })
      initPointer({
        canvas,
        pointer,
        signal,
        world: world.current,
      })
      initKeyboard({ canvas, pointer, signal })
      initSimulator({
        pointer,
        world: world.current,
        signal,
      })
      return () => {
        controller.abort()
      }
    }
  }, [canvas])
}
