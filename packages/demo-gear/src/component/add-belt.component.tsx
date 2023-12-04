import { use, useEffect, useRef, useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
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

  const cameraTilePosition = useCameraTilePosition(context)
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition

  const start = savedStart ?? cameraTilePosition

  const valid = useHand(start, end)

  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          if (savedStart) {
            setSavedStart(null)
          } else {
            navigate('..')
          }
        }}
      >
        Back
      </button>
      {!savedStart && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            setSavedStart(cameraTilePosition)
          }}
        >
          Start
        </button>
      )}
    </Overlay>
  )
}

function useHand(
  start: SimpleVec2,
  end: SimpleVec2 | null,
): boolean {
  const context = use(AppContext)

  const [valid, setValid] = useState<boolean>(
    isValid(context, start, end),
  )

  const hand = useRef<AddBeltHand>({
    type: HandType.AddBelt,
    start,
    end: null,
    valid,
  })

  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [context])

  useEffect(() => {
    setValid(isValid(context, start, end))
  }, [start, end])

  useEffect(() => {
    invariant(start || !end)
    hand.current.start = start
    hand.current.end = end
    hand.current.valid = valid
  }, [start, end, valid])

  return valid
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

function useSavedStart(): [
  SimpleVec2 | null,
  (start: SimpleVec2 | null) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const savedJson = searchParams.get('start')
  let saved: SimpleVec2 | null = null
  if (savedJson) {
    saved = SimpleVec2.parse(JSON.parse(savedJson))
  }

  const setStart = (next: SimpleVec2 | null) => {
    setSearchParams((prev) => {
      if (next) {
        prev.set('start', JSON.stringify(next))
      } else {
        prev.delete('start')
      }
      return prev
    })
  }

  return [saved, setStart]
}

function isValid(
  context: IAppContext,
  start: SimpleVec2,
  end: SimpleVec2 | null,
): boolean {
  return true
}
