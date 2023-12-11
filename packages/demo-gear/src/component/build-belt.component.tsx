import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { getAccelerationMap } from '../apply-torque.js'
import { build } from '../build.js'
import {
  AdjacentConnection,
  Belt,
  BeltDirection,
  BeltEntity,
  BeltIntersectionEntity,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  GearEntity,
  HandType,
  IAppContext,
  SimpleVec2,
  World,
} from '../types.js'
import {
  getEntity,
  getFirstExternalConnection,
} from '../util.js'
import styles from './build-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

export function BuildBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [direction, setDirection] = useDirection()

  const cameraTilePosition = useCameraTilePosition()
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition
  const start = savedStart ?? cameraTilePosition
  const belts = useBelts(context, start, end, direction)
  const valid = isValid(context, belts)
  const hand = useHand(belts, valid)

  console.log(valid)
  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      {savedStart && (
        <button
          className={styles.button}
          onPointerUp={() => {
            setSavedStart(null)
          }}
        >
          Cancel
        </button>
      )}
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
            if (!valid) return
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
            build(context, hand)
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

function getBeltConnections(
  context: IAppContext,
  position: SimpleVec2,
  direction: BeltDirection,
): Connection[] {
  const connections: Connection[] = []

  if (direction === 'x') {
    // prettier-ignore
    const north = context.world.tiles[`${position.x}.${position.y - 1}`]
    if (north?.entityId) {
      const entity = getEntity(context, north.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.x !== position.x &&
            entity.center.x !== position.x + 1
          ) {
            break
          }

          if (
            entity.center.y + entity.radius !==
            position.y
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: -1,
          })

          break
        }
        case EntityType.enum.Belt:
        case EntityType.enum.BeltIntersection: {
          // TODO
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
    // prettier-ignore
    const south = context.world.tiles[`${position.x}.${position.y + 1}`]
    if (south?.entityId) {
      const entity = getEntity(context, south.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.x !== position.x &&
            entity.center.x !== position.x + 1
          ) {
            break
          }

          if (
            entity.center.y - entity.radius - 1 !==
            position.y
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: 1,
          })

          break
        }
        case EntityType.enum.Belt:
        case EntityType.enum.BeltIntersection: {
          // TODO
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
  } else {
    invariant(direction === 'y')

    // prettier-ignore
    const east = context.world.tiles[`${position.x + 1}.${position.y}`]
    if (east?.entityId) {
      const entity = getEntity(context, east.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.y !== position.y &&
            entity.center.y !== position.y + 1
          ) {
            break
          }

          if (
            entity.center.x - entity.radius - 1 !==
            position.x
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: -1,
          })

          break
        }
        case EntityType.enum.Belt:
        case EntityType.enum.BeltIntersection: {
          // TODO
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
    const west =
      context.world.tiles[`${position.x - 1}.${position.y}`]
    if (west?.entityId) {
      const entity = getEntity(context, west.entityId)
      switch (entity.type) {
        case EntityType.enum.Gear: {
          if (
            entity.center.y !== position.y &&
            entity.center.y !== position.y + 1
          ) {
            break
          }

          if (
            entity.center.x + entity.radius !==
            position.x
          ) {
            break
          }

          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: entity.id,
            multiplier: 1,
          })

          break
        }
        case EntityType.enum.Belt:
        case EntityType.enum.BeltIntersection: {
          // TODO
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }
  }

  return connections
}

function addBelt(
  context: IAppContext,
  belts: Belt[],
  position: SimpleVec2,
  direction: BeltDirection,
): void {
  const id = getBeltId(position)
  const connections = getBeltConnections(
    context,
    position,
    direction,
  )
  const prev = belts.at(-1)
  if (prev) {
    let multiplier = 1
    if (
      prev.type === EntityType.enum.BeltIntersection &&
      (prev.position.x > position.x ||
        prev.position.y > position.y)
    ) {
      multiplier = -1
    }

    prev.connections.push({
      entityId: id,
      multiplier,
      type: ConnectionType.enum.Belt,
    })
    connections.push({
      entityId: prev.id,
      multiplier,
      type: ConnectionType.enum.Belt,
    })
  }

  belts.push({
    type: EntityType.enum.Belt,
    id,
    position,
    connections,
    direction,
    offset: 0,
    velocity: 0,
    mass: 1,
  })
}

function addBeltIntersection(
  _context: IAppContext,
  belts: Belt[],
  position: SimpleVec2,
): void {
  const id = getBeltId(position)
  const connections: Connection[] = []
  const prev = belts.at(-1)
  if (prev) {
    let multiplier = -1
    if (
      prev.position.x < position.x ||
      prev.position.y < position.y
    ) {
      multiplier = 1
    }

    prev.connections.push({
      entityId: id,
      multiplier,
      type: ConnectionType.enum.Belt,
    })
    connections.push({
      entityId: prev.id,
      multiplier,
      type: ConnectionType.enum.Belt,
    })
  }
  belts.push({
    id: getBeltId(position),
    type: EntityType.enum.BeltIntersection,
    position,
    connections,
    offset: 0,
    velocity: 0,
    mass: 1,
  })
}

function useBelts(
  context: IAppContext,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: BeltDirection,
): Belt[] {
  const buildVersion = useWorldBuildVersion()
  return useMemo(() => {
    const dx = end ? end.x - start.x : 0
    const dy = end ? end.y - start.y : 0

    const belts = new Array<Belt>()

    if (direction === 'x') {
      for (
        let x = 0;
        x < Math.abs(dx) + (dy === 0 ? 1 : 0);
        x += 1
      ) {
        addBelt(
          context,
          belts,
          {
            x: start.x + x * Math.sign(dx),
            y: start.y,
          },
          direction,
        )
      }

      if (dy !== 0) {
        if (belts.length) {
          addBeltIntersection(context, belts, {
            x: start.x + dx,
            y: start.y,
          })
        }

        for (
          let y = belts.length ? 1 : 0;
          y < Math.abs(dy) + 1;
          y += 1
        ) {
          addBelt(
            context,
            belts,
            {
              x: start.x + dx,
              y: start.y + y * Math.sign(dy),
            },
            'y',
          )
        }
      }
    } else {
      for (
        let y = 0;
        y < Math.abs(dy) + (dx === 0 ? 1 : 0);
        y += 1
      ) {
        addBelt(
          context,
          belts,
          {
            x: start.x,
            y: start.y + y * Math.sign(dy),
          },
          direction,
        )
      }

      if (dx !== 0) {
        if (belts.length) {
          addBeltIntersection(context, belts, {
            x: start.x,
            y: start.y + dy,
          })
        }

        for (
          let x = belts.length ? 1 : 0;
          x < Math.abs(dx) + 1;
          x += 1
        ) {
          addBelt(
            context,
            belts,
            {
              x: start.x + x * Math.sign(dx),
              y: start.y + dy,
            },
            'x',
          )
        }
      }
    }

    return belts
  }, [context, start, end, direction, buildVersion])
}

function useHand(belts: Belt[], valid: boolean): BuildHand {
  const context = use(AppContext)

  const entities: Record<EntityId, Entity> = {}
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const hand = useRef<BuildHand>({
    type: HandType.Build,
    entities,
    valid,
  })

  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.entities = entities
    hand.current.valid = valid
  }, [belts, valid])

  return hand.current
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
): boolean {
  for (const { position } of belts) {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    if (!tile) continue
    if (tile.entityId) {
      return false
    }
  }

  const first = getFirstExternalConnection(context, {
    type: HandType.Build,
    // TODO need to refactor this because we don't have hand here yet..
    entities: Object.values(belts).reduce(
      (acc, belt) => ({
        ...acc,
        [belt.id]: belt,
      }),
      {},
    ),
    valid: true,
  })

  if (!first) {
    // no adjacent gears, belt is not moving
    return true
  }

  const entities = { ...context.world.entities }
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const accelerationMap = getAccelerationMap(
    first.root,
    1,
    entities,
  )

  console.log(accelerationMap)

  if (!accelerationMap) {
    return false
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
