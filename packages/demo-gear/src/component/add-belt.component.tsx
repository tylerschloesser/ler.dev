import { use, useCallback, useEffect, useRef } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { addBelts, getBeltConnections } from '../belt.js'
import {
  AddBeltHand,
  Belt,
  BeltDirection,
  BeltPath,
  BeltType,
  ConnectionType,
  EntityId,
  HandType,
  IAppContext,
  SimpleVec2,
  World,
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
  const belts = getBelts(
    context.world,
    start,
    end,
    direction,
  )
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

function getBeltId(position: SimpleVec2): EntityId {
  return `${position.x}.${position.y}`
}

function getStraightBeltId(path: BeltPath): EntityId {
  const first = path.at(0)
  invariant(first)
  return getBeltId(first)
}

function getIntersectionBeltId(
  position: SimpleVec2,
): EntityId {
  return getBeltId(position)
}

function getBelts(
  world: World,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: BeltDirection,
): Belt[] {
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  const belts: Belt[] = []

  if (direction === 'x') {
    let path: BeltPath = []
    for (
      let x = 0;
      x < Math.abs(dx) + (dy === 0 ? 1 : 0);
      x += 1
    ) {
      path.push({
        x: start.x + x * Math.sign(dx),
        y: start.y,
      })
    }
    if (path.length) {
      belts.push({
        id: getStraightBeltId(path),
        type: BeltType.enum.Straight,
        connections: getBeltConnections(
          world,
          path,
          direction,
        ),
        direction,
        offset: 0,
        velocity: 0,
        path,
      })
    }

    if (dy !== 0) {
      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x + dx,
          y: start.y,
        }
        belts.push({
          id: getIntersectionBeltId(position),
          type: BeltType.enum.Intersection,
          connections: [],
          offset: 0,
          velocity: 0,
          position,
        })
      }

      path = []
      for (
        let y = belts.length ? 1 : 0;
        y < Math.abs(dy) + 1;
        y += 1
      ) {
        path.push({
          x: start.x + dx,
          y: start.y + y * Math.sign(dy),
        })
      }
      belts.push({
        id: getStraightBeltId(path),
        type: BeltType.enum.Straight,
        connections: getBeltConnections(world, path, 'y'),
        direction: 'y',
        offset: 0,
        velocity: 0,
        path,
      })
    }
  } else {
    let path: BeltPath = []
    for (
      let y = 0;
      y < Math.abs(dy) + (dx === 0 ? 1 : 0);
      y += 1
    ) {
      path.push({
        x: start.x,
        y: start.y + y * Math.sign(dy),
      })
    }
    if (path.length) {
      belts.push({
        id: getStraightBeltId(path),
        type: BeltType.enum.Straight,
        connections: getBeltConnections(
          world,
          path,
          direction,
        ),
        direction,
        offset: 0,
        velocity: 0,
        path,
      })
    }

    if (dx !== 0) {
      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x,
          y: start.y + dy,
        }
        belts.push({
          id: getIntersectionBeltId(position),
          type: BeltType.enum.Intersection,
          connections: [],
          offset: 0,
          velocity: 0,
          position,
        })
      }

      path = []
      for (
        let x = belts.length ? 1 : 0;
        x < Math.abs(dx) + 1;
        x += 1
      ) {
        path.push({
          x: start.x + x * Math.sign(dx),
          y: start.y + dy,
        })
      }
      belts.push({
        id: getStraightBeltId(path),
        type: BeltType.enum.Straight,
        connections: getBeltConnections(world, path, 'x'),
        direction: 'x',
        offset: 0,
        velocity: 0,
        path,
      })
    }
  }

  // TODO fix this
  // // either 1 straight, or 1 straight, 1 intersection, and 1 straight
  // invariant(belts.length === 1 || belts.length === 3)

  // if (belts.length === 3) {
  //   const straight1 = belts.at(0)
  //   const intersection = belts.at(1)
  //   const straight2 = belts.at(2)

  //   invariant(straight1?.type === BeltType.enum.Straight)
  //   invariant(
  //     intersection?.type === BeltType.enum.Intersection,
  //   )
  //   invariant(straight2?.type === BeltType.enum.Straight)

  //   straight1.connections.push({
  //     type: ConnectionType.enum.Belt,
  //     entityId: intersection.id,
  //     multiplier: 1,
  //   })

  //   intersection.connections.push(
  //     {
  //       type: ConnectionType.enum.Belt,
  //       entityId: straight1.id,
  //       multiplier: 1,
  //     },
  //     {
  //       type: ConnectionType.enum.Belt,
  //       entityId: straight2.id,
  //       multiplier: 1,
  //     },
  //   )

  //   straight2.connections.push({
  //     type: ConnectionType.enum.Belt,
  //     entityId: intersection.id,
  //     multiplier: 1,
  //   })
  // }

  console.log(belts)
  return belts
}

function useHand(belts: Belt[], valid: boolean): boolean {
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
  belts: Belt[],
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
      if (tile.entityId || tile.beltId) {
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
