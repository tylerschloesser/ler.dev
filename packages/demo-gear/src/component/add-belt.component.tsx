import { use, useEffect, useRef, useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
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

type PathDirection = 'x' | 'y'

export function AddBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()

  const [direction, setDirection] =
    useState<PathDirection>('x')

  const cameraTilePosition = useCameraTilePosition(context)
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition
  const start = savedStart ?? cameraTilePosition
  const path = getPath(start, end, direction)
  const valid = isValid(context, path)
  useHand(path, valid)

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
      {end && (
        <button
          className={styles.button}
          disabled={
            start.x - end.x === 0 || start.y - end.y === 0
          }
          onPointerUp={() => {
            setDirection(direction === 'x' ? 'y' : 'x')
          }}
        >
          Flip
        </button>
      )}
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
      {savedStart && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            console.log('TODO')
          }}
        >
          Build
        </button>
      )}
    </Overlay>
  )
}

function getPath(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: PathDirection,
): SimpleVec2[] {
  const path: SimpleVec2[] = []
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  if (direction === 'x') {
    for (
      let x = 0;
      Math.abs(x) <= Math.abs(dx);
      x += Math.sign(dx) || 1
    ) {
      path.push({
        x: start.x + x,
        y: start.y,
      })
    }
    for (
      let y = Math.sign(dy) || 1;
      Math.abs(y) <= Math.abs(dy);
      y += Math.sign(dy) || 1
    ) {
      path.push({
        x: end?.x ?? start.x,
        y: start.y + y,
      })
    }
  } else {
    for (
      let y = 0;
      Math.abs(y) <= Math.abs(dy);
      y += Math.sign(dy) || 1
    ) {
      path.push({
        x: start.x,
        y: start.y + y,
      })
    }
    for (
      let x = Math.sign(dx) || 1;
      Math.abs(x) <= Math.abs(dx);
      x += Math.sign(dx) || 1
    ) {
      path.push({
        x: start.x + x,
        y: end?.y ?? start.y,
      })
    }
  }
  return path
}

function useHand(
  path: SimpleVec2[],
  valid: boolean,
): boolean {
  const context = use(AppContext)

  const hand = useRef<AddBeltHand>({
    type: HandType.AddBelt,
    path,
    valid,
  })

  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.path = path
    hand.current.valid = valid
  }, [path, valid])

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
  path: SimpleVec2[],
): boolean {
  for (const position of path) {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    if (!tile) continue
    if (tile.gearId || tile.beltId) {
      return false
    }
  }
  return true
}
