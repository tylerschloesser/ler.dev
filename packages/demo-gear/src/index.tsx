import { useEffect, useRef, useState } from 'react'
import { addGear } from './add-gear.js'
import { GEAR_SIZES } from './const.js'
import styles from './index.module.scss'
import { initCanvas } from './init-canvas.js'
import { initPointer } from './init-pointer.js'
import { initSimulator } from './init-simulator.js'
import { Toolbar } from './toolbar.js'
import {
  Pointer,
  PointerType,
  World,
  initKeyboardFn,
} from './types.js'

const initKeyboard: initKeyboardFn = ({
  signal,
  pointer,
}) => {
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'q') {
        pointer.current = {
          type: PointerType.Null,
          state: null,
        }
      }
    },
    { signal },
  )
}

function useWorld(): React.MutableRefObject<World> {
  return useRef(
    (() => {
      const world: World = {
        gears: {},
        tiles: {},
      }

      addGear({
        position: {
          x: 0,
          y: 0,
        },
        size: GEAR_SIZES[1]!,
        world,
      })
      addGear({
        position: {
          x: 5,
          y: 0,
        },
        size: GEAR_SIZES[3]!,
        world,
      })

      return world
    })(),
  )
}

export function DemoGear() {
  const pointer = useRef<Pointer>({
    type: PointerType.AddGear,
    size: GEAR_SIZES[0]!,
    state: null,
  })
  const [canvas, setCanvas] =
    useState<HTMLCanvasElement | null>(null)

  const world = useWorld()

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
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar pointer={pointer} />
      </div>
      <canvas className={styles.canvas} ref={setCanvas} />
    </div>
  )
}
