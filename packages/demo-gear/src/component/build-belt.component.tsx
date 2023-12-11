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
  Belt,
  BeltDirection,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  HandType,
  IAppContext,
  Network,
  SimpleVec2,
} from '../types.js'
import {
  getEntity,
  getExternalConnections,
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
  const { belts, network } = useBelts(
    context,
    start,
    end,
    direction,
  )
  const valid = isValid(context, belts)
  const hand = useHand(belts, network, valid)

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
  network: Network,
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

  const mass = 1
  belts.push({
    type: EntityType.enum.Belt,
    id,
    networkId: network.id,
    position,
    connections,
    direction,
    offset: 0,
    velocity: 0,
    mass,
  })

  invariant(!network.entityIds[id])
  network.entityIds[id] = true
  network.mass += mass
}

function addBeltIntersection(
  _context: IAppContext,
  network: Network,
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

  const mass = 1
  belts.push({
    id: getBeltId(position),
    networkId: network.id,
    type: EntityType.enum.BeltIntersection,
    position,
    connections,
    offset: 0,
    velocity: 0,
    mass,
  })

  invariant(!network.entityIds[id])
  network.entityIds[id] = true
  network.mass += mass
}

function useBelts(
  context: IAppContext,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  direction: BeltDirection,
): {
  belts: Belt[]
  network: Network
} {
  const buildVersion = useWorldBuildVersion()
  return useMemo(() => {
    const dx = end ? end.x - start.x : 0
    const dy = end ? end.y - start.y : 0

    const belts = new Array<Belt>()

    // TODO this doesn't seem super safe assumption
    const rootId = `${start.x}.${start.y}`
    const network: Network = {
      id: rootId,
      entityIds: {},
      mass: 0,
      rootId,
    }

    if (direction === 'x') {
      for (
        let x = 0;
        x < Math.abs(dx) + (dy === 0 ? 1 : 0);
        x += 1
      ) {
        addBelt(
          context,
          network,
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
          addBeltIntersection(context, network, belts, {
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
            network,
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
          network,
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
          addBeltIntersection(context, network, belts, {
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
            network,
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

    return { belts, network }
  }, [context, start, end, direction, buildVersion])
}

function useHand(
  belts: Belt[],
  network: Network,
  valid: boolean,
): BuildHand {
  const context = use(AppContext)

  const hand = useMemo<BuildHand>(() => {
    const entities: Record<EntityId, Entity> = {}
    for (const belt of belts) {
      entities[belt.id] = belt
    }

    return {
      type: HandType.Build,
      entities,
      networks: { [network.id]: network },
      valid,
    }
  }, [belts, network, valid])

  useEffect(() => {
    context.hand = hand
    return () => {
      context.hand = null
    }
  }, [hand])

  return hand
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
  for (const { position } of belts) {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    if (!tile) continue
    if (tile.entityId) {
      return false
    }
  }

  const buildEntities = Object.values(belts).reduce(
    (acc, belt) => ({
      ...acc,
      [belt.id]: belt,
    }),
    {},
  )

  const root = Object.values(belts).at(0)
  invariant(root)

  const first = getExternalConnections(
    context,
    buildEntities,
    root,
  ).at(0)

  if (!first) {
    // no adjacent gears, belt is not moving
    return true
  }

  const entities = { ...context.world.entities }
  for (const belt of belts) {
    entities[belt.id] = belt
  }

  const accelerationMap = getAccelerationMap(
    first.source,
    1,
    entities,
  )

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
