import { use, useEffect, useRef, useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import * as z from 'zod'
import {
  AddBeltHand,
  CameraListenerFn,
  HandType,
  IAppContext,
  SimpleVec2,
} from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [valid, setValid] = useState<boolean>(false)
  const cameraTilePosition = useCameraTilePosition(context)

  const hand = useRef<AddBeltHand>({
    type: HandType.AddBelt,
    start: cameraTilePosition,
    end: null,
    valid: false,
  })

  useEffect(() => {
    if (!context) return
    invariant(context.hand === null)

    context.hand = {
      type: HandType.AddBelt,
      start: cameraTilePosition,
      end: null,
      valid: false,
    }

    const cameraListener: CameraListenerFn = () => {
      invariant(context.hand?.type === HandType.AddBelt)
      const x = Math.floor(context.camera.position.x)
      const y = Math.floor(context.camera.position.y)
      if (context.hand.start === null) {
        const tileId = `${x}.${y}`
        const tile = context.world.tiles[tileId]
        setValid(
          (context.hand.valid = !(
            tile?.beltId || tile?.gearId
          )),
        )
      } else {
      }
    }
    context.cameraListeners.add(cameraListener)
    cameraListener(context)

    return () => {
      context.hand = null
      context.cameraListeners.delete(cameraListener)
    }
  }, [context])

  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          // if (start) {
          //   setStart(null)
          // } else {
          //   navigate('..')
          // }
        }}
      >
        Back
      </button>
      {/* !start && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!context) return
            setStart({
              x: Math.floor(context.camera.position.x),
              y: Math.floor(context.camera.position.y),
            })
          }}
        >
          Start
        </button>
      ) */}
    </Overlay>
  )
}

function useCameraTilePosition(
  context: IAppContext,
): SimpleVec2 {
  const [position, setPosition] = useState<SimpleVec2>({
    x: Math.floor(context.camera.position.x),
    y: Math.floor(context.camera.position.y),
  })

  useEffect(() => {
    const listener: CameraListenerFn = () => {
      const x = Math.floor(context.camera.position.x)
      const y = Math.floor(context.camera.position.y)
      setPosition((prev) => {
        if (prev.x === x && prev.y === y) {
          return prev
        }
        return { x, y }
      })
    }
    context.cameraListeners.add(listener)
    return () => {
      context.cameraListeners.delete(listener)
    }
  }, [])

  return position
}

const Start = SimpleVec2.nullable()
type Start = z.infer<typeof Start>

function useStart(
  context: IAppContext,
): [Start, (next: Start) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const parsed = Start.parse(
    JSON.parse(searchParams.get('start') ?? 'null'),
  )

  useEffect(() => {}, [])

  const start = useRef(parsed)

  if (!isEqual(parsed, start.current)) {
    start.current = parsed
  }

  const setStart = (next: SimpleVec2 | null) => {
    if (isEqual(next, start.current)) {
      return
    }
    setSearchParams((prev) => {
      if (next) {
        prev.set('start', JSON.stringify(next))
      } else {
        prev.delete('start')
      }
      return prev
    })
  }

  return [start.current, setStart]
}

function isEqual(
  a: SimpleVec2 | null,
  b: SimpleVec2 | null,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
