import { use, useCallback, useEffect, useRef } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { getAccelerationMap } from '../apply-torque.js'
import { addBelts } from '../belt.js'
import {
  AddBeltHand,
  AdjacentConnection,
  Belt,
  BeltDirection,
  BeltEntity,
  BeltIntersectionEntity,
  BeltMotion,
  ConnectionType,
  EntityId,
  EntityType,
  GearEntity,
  HandType,
  IAppContext,
  SimpleVec2,
  World,
} from '../types.js'
import styles from './build-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'

export function BuildBelt() {
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

function getBelts(
  world: World,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: BeltDirection,
): Belt[] {
  const dx = end ? end.x - start.x : 0
  const dy = end ? end.y - start.y : 0

  const belts = new Array<Belt>()

  if (direction === 'x') {
    for (
      let x = 0;
      x < Math.abs(dx) + (dy === 0 ? 1 : 0);
      x += 1
    ) {
      const position: SimpleVec2 = {
        x: start.x + x * Math.sign(dx),
        y: start.y,
      }
      belts.push({
        type: EntityType.enum.Belt,
        id: getBeltId(position),
        position,
        connections: [],
        direction,
        offset: 0,
        velocity: 0,
        mass: 1,
      })
    }

    if (dy !== 0) {
      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x + dx,
          y: start.y,
        }
        belts.push({
          id: getBeltId(position),
          type: EntityType.enum.BeltIntersection,
          position,
          connections: [],
          offset: 0,
          velocity: 0,
          mass: 1,
        })
      }

      for (
        let y = belts.length ? 1 : 0;
        y < Math.abs(dy) + 1;
        y += 1
      ) {
        const position: SimpleVec2 = {
          x: start.x + dx,
          y: start.y + y * Math.sign(dy),
        }
        belts.push({
          type: EntityType.enum.Belt,
          id: getBeltId(position),
          position,
          connections: [],
          direction: 'y',
          offset: 0,
          velocity: 0,
          mass: 1,
        })
      }
    }
  } else {
    for (
      let y = 0;
      y < Math.abs(dy) + (dx === 0 ? 1 : 0);
      y += 1
    ) {
      const position: SimpleVec2 = {
        x: start.x,
        y: start.y + y * Math.sign(dy),
      }
      belts.push({
        type: EntityType.enum.Belt,
        id: getBeltId(position),
        position,
        connections: [],
        direction,
        offset: 0,
        velocity: 0,
        mass: 1,
      })
    }

    if (dx !== 0) {
      if (belts.length) {
        const position: SimpleVec2 = {
          x: start.x,
          y: start.y + dy,
        }
        belts.push({
          id: getBeltId(position),
          type: EntityType.enum.BeltIntersection,
          connections: [],
          offset: 0,
          velocity: 0,
          position,
          mass: 1,
        })
      }

      for (
        let x = belts.length ? 1 : 0;
        x < Math.abs(dx) + 1;
        x += 1
      ) {
        const position: SimpleVec2 = {
          x: start.x + x * Math.sign(dx),
          y: start.y + dy,
        }
        belts.push({
          type: EntityType.enum.Belt,
          id: getBeltId(position),
          position,
          connections: [],
          direction: 'x',
          offset: 0,
          velocity: 0,
          mass: 1,
        })
      }
    }
  }

  return belts
}

function useHand(
  belts: Belt[],
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

function getFirstAdjacentConnection(
  context: IAppContext,
  belts: Belt[],
): {
  belt: BeltEntity | BeltIntersectionEntity
  gear: GearEntity
  connection: AdjacentConnection
} | null {
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
  belts: Belt[],
): { valid: boolean; motion?: BeltMotion } {
  for (const { position } of belts) {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    if (!tile) continue
    if (tile.entityId) {
      return { valid: false }
    }
  }

  const adjacent = getFirstAdjacentConnection(
    context,
    belts,
  )
  if (!adjacent) {
    // no adjacent gears, belt is not moving
    return { valid: true }
  }

  const entities = { ...context.world.entities }
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const accelerationMap = getAccelerationMap(
    adjacent.belt,
    adjacent.connection.multiplier,
    entities,
  )

  if (!accelerationMap) {
    return { valid: false }
  }

  return {
    valid: true,
    motion: {
      accelerationMap,
      source: adjacent.gear,
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
