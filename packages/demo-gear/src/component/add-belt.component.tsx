import { use, useCallback, useEffect, useRef } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { addBelts } from '../belt.js'
import {
  AddBeltHand,
  BeltDirection,
  BeltPath,
  BeltType,
  HandType,
  IAppContext,
  PartialBelt,
  SimpleVec2,
} from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'

export function AddBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [direction, setDirection] = useDirection()

  const cameraTilePosition = useCameraTilePosition()
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition
  const start = savedStart ?? cameraTilePosition
  const belts = getBelts(start, end, direction)
  const valid = isValid(context, belts)
  useHand(belts, valid)

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
            addBelts(context.world, belts)
            setSavedStart(null)
          }}
        >
          Build
        </button>
      )}
    </Overlay>
  )
}

function getBelts(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: BeltDirection,
): PartialBelt[] {
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  const belts: PartialBelt[] = []

  if (direction === 'x') {
    let path: BeltPath = []
    for (
      let x = 0;
      x < Math.abs(dx) + (dy === 0 ? 0 : 1);
      x += 1
    ) {
      path.push({
        x: start.x + x * Math.sign(dx),
        y: start.y,
      })
    }
    belts.push({
      type: BeltType.enum.Straight,
      connections: [], // TODO
      direction,
      offset: 0,
      path,
    })

    if (dy !== 0) {
      belts.push({
        type: BeltType.enum.Intersection,
        connections: [], // TODO
        offset: 0,
        position: { x: start.x + dx, y: start.y },
      })

      path = []
      for (let y = 1; y < Math.abs(dy) + 1; y += 1) {
        path.push({
          x: start.x + dx,
          y: y * Math.sign(dy),
        })
      }
      belts.push({
        type: BeltType.enum.Straight,
        connections: [], // TODO
        direction: 'y',
        offset: 0,
        path,
      })
    }
  } else {
    // TODO
  }
  return belts
}

function useHand(
  belts: PartialBelt[],
  valid: boolean,
): boolean {
  const context = use(AppContext)

  const hand = useRef<AddBeltHand>({
    type: HandType.AddBelt,
    belts,
    valid,
  })

  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.belts = belts
    hand.current.valid = valid
  }, [belts, valid])

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
  belts: PartialBelt[],
): boolean {
  for (const belt of belts) {
    const path =
      belt.type === BeltType.enum.Straight
        ? belt.path
        : [belt.position]
    for (const position of path) {
      const tileId = `${position.x}.${position.y}`
      const tile = context.world.tiles[tileId]
      if (!tile) continue
      if (tile.gearId || tile.beltId) {
        return false
      }
    }
  }
  return true
}

function useDirection(): [
  BeltDirection,
  (direction: BeltDirection) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const direction = BeltDirection.parse(
    searchParams.get('direction') ?? 'x',
  )

  const setDirection = useCallback(
    (next: BeltDirection) => {
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
