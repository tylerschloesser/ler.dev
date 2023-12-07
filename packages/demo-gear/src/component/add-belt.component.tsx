import { use, useCallback, useEffect, useRef } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { getForceMultiplierMap } from '../apply-torque.js'
import { addBelts, getBeltConnections } from '../belt.js'
import {
  AddBeltHand,
  AdjacentConnection,
  BeltDirection,
  BeltEntity,
  BeltIntersectionEntity,
  BeltMotion,
  BeltMotionSource,
  BeltPath,
  ConnectionType,
  EntityId,
  EntityType,
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
): AddBeltHand['belts'] {
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  const belts: ReturnType<typeof getBelts> = []

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
        type: EntityType.enum.Belt,
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
      let intersection: BeltIntersectionEntity | undefined

      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x + dx,
          y: start.y,
        }
        intersection = {
          id: getIntersectionBeltId(position),
          type: EntityType.enum.BeltIntersection,
          connections: [],
          offset: 0,
          velocity: 0,
          position,
        }

        invariant(belts.length === 1)
        const prev = belts.at(0)
        invariant(prev?.type === EntityType.enum.Belt)

        invariant(dx !== 0)
        const multiplier = Math.sign(dx)

        prev.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: intersection.id,
          multiplier,
        })

        intersection.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: prev.id,
          multiplier,
        })

        belts.push(intersection)
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

      const next: BeltEntity = {
        id: getStraightBeltId(path),
        type: EntityType.enum.Belt,
        connections: getBeltConnections(world, path, 'y'),
        direction: 'y',
        offset: 0,
        velocity: 0,
        path,
      }

      if (intersection) {
        invariant(dy !== 0)
        const multiplier = Math.sign(dy)
        intersection.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: next.id,
          multiplier,
        })
        next.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: intersection.id,
          multiplier,
        })
      }

      belts.push(next)
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
        type: EntityType.enum.Belt,
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
      let intersection: BeltIntersectionEntity | undefined

      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x,
          y: start.y + dy,
        }
        intersection = {
          id: getIntersectionBeltId(position),
          type: EntityType.enum.BeltIntersection,
          connections: [],
          offset: 0,
          velocity: 0,
          position,
        }

        invariant(belts.length === 1)
        const prev = belts.at(0)
        invariant(prev?.type === EntityType.enum.Belt)

        invariant(dy !== 0)
        const multiplier = Math.sign(dy)

        prev.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: intersection.id,
          multiplier,
        })

        intersection.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: prev.id,
          multiplier,
        })

        belts.push(intersection)
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
      const next: BeltEntity = {
        id: getStraightBeltId(path),
        type: EntityType.enum.Belt,
        connections: getBeltConnections(world, path, 'x'),
        direction: 'x',
        offset: 0,
        velocity: 0,
        path,
      }

      if (intersection) {
        invariant(dx !== 0)
        const multiplier = Math.sign(dx)
        intersection.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: next.id,
          multiplier,
        })
        next.connections.push({
          type: ConnectionType.enum.Belt,
          entityId: intersection.id,
          multiplier,
        })
      }

      belts.push(next)
    }
  }

  return belts
}

function useHand(
  belts: AddBeltHand['belts'],
  { valid, motion }: ReturnType<typeof isValid>,
): boolean {
  const context = use(AppContext)

  const hand = useRef<AddBeltHand>({
    type: HandType.AddBelt,
    belts,
    valid,
    motion,
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
    hand.current.motion = motion
  }, [belts, valid, motion])

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

function getBeltMotionSource(
  context: IAppContext,
  belts: AddBeltHand['belts'],
): BeltMotionSource | null {
  for (const belt of belts) {
    const connection = belt.connections.find(
      (c): c is AdjacentConnection =>
        c.type === ConnectionType.enum.Adjacent,
    )
    if (!connection) {
      continue
    }
    const gear = context.world.entities[connection.entityId]
    invariant(gear?.type === EntityType.enum.Gear)

    return { belt, gear, connection }
  }

  return null
}

function isValid(
  context: IAppContext,
  belts: AddBeltHand['belts'],
): { valid: boolean; motion?: BeltMotion } {
  for (const belt of belts) {
    const path =
      belt.type === EntityType.enum.Belt
        ? belt.path
        : [belt.position]
    for (const position of path) {
      const tileId = `${position.x}.${position.y}`
      const tile = context.world.tiles[tileId]
      if (!tile) continue
      if (tile.entityId || tile.beltId) {
        return { valid: false }
      }
    }
  }

  const source = getBeltMotionSource(context, belts)
  if (!source) {
    return { valid: true }
  }

  const entities = { ...context.world.entities }
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const forceMultiplierMap = getForceMultiplierMap(
    source.belt,
    entities,
  )

  if (!forceMultiplierMap) {
    return { valid: false }
  }

  return {
    valid: true,
    motion: {
      forceMultiplierMap,
      source,
    },
  }
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
