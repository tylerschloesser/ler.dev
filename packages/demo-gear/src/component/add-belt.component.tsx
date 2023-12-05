import { use, useCallback, useEffect, useRef } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import * as z from 'zod'
import { addBelt } from '../belt.js'
import {
  AddBeltHand,
  BeltPath,
  HandType,
  IAppContext,
  SimpleVec2,
} from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'

const PathDirection = z.union([
  z.literal('x'),
  z.literal('y'),
])
type PathDirection = z.infer<typeof PathDirection>

export function AddBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [direction, setDirection] = useDirection()

  const cameraTilePosition = useCameraTilePosition()
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
      <button
        className={styles.button}
        onPointerUp={() => {
          setDirection(direction === 'x' ? 'y' : 'x')
        }}
      >
        Rotate
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
      {savedStart && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!valid) return
            addBelt(context.world, path)
            setSavedStart(null)
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
): BeltPath {
  const path: BeltPath = []
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  if (direction === 'x') {
    for (
      let x = 0;
      Math.abs(x) <= Math.abs(dx);
      x += Math.sign(dx) || 1
    ) {
      path.push({
        position: {
          x: start.x + x,
          y: start.y,
        },
        direction: 'x',
      })
    }
    for (
      let y = Math.sign(dy) || 1;
      Math.abs(y) <= Math.abs(dy);
      y += Math.sign(dy) || 1
    ) {
      path.push({
        position: {
          x: end?.x ?? start.x,
          y: start.y + y,
        },
        direction: 'y',
      })
    }
  } else {
    for (
      let y = 0;
      Math.abs(y) <= Math.abs(dy);
      y += Math.sign(dy) || 1
    ) {
      path.push({
        position: {
          x: start.x,
          y: start.y + y,
        },
        direction: 'y',
      })
    }
    for (
      let x = Math.sign(dx) || 1;
      Math.abs(x) <= Math.abs(dx);
      x += Math.sign(dx) || 1
    ) {
      path.push({
        position: {
          x: start.x + x,
          y: end?.y ?? start.y,
        },
        direction: 'x',
      })
    }
  }
  return path
}

function useHand(path: BeltPath, valid: boolean): boolean {
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

  const setStart = useCallback(
    (next: SimpleVec2 | null) => {
      setSearchParams((prev) => {
        if (next) {
          prev.set('start', JSON.stringify(next))
        } else {
          prev.delete('start')
        }
        return prev
      })
    },
    [setSearchParams],
  )

  return [saved, setStart]
}

function isValid(
  context: IAppContext,
  path: BeltPath,
): boolean {
  for (const { position } of path) {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    if (!tile) continue
    if (tile.gearId || tile.beltId) {
      return false
    }
  }
  return true
}

function useDirection(): [
  PathDirection,
  (direction: PathDirection) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const direction = PathDirection.parse(
    searchParams.get('direction') ?? 'x',
  )

  const setDirection = useCallback(
    (next: PathDirection) => {
      setSearchParams(
        (prev) => {
          prev.set('direction', next)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [direction, setDirection]
}
