import { use, useCallback, useEffect, useMemo } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import * as z from 'zod'
import { getAccelerationMap } from '../apply-torque.js'
import { build } from '../build.js'
import {
  Belt,
  BeltTurn,
  BuildHand,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  HandType,
  IAppContext,
  Network,
  Rotation,
  SimpleVec2,
} from '../types.js'
import {
  getEntity,
  getExternalConnections,
  isHorizontal,
  isVertical,
} from '../util.js'
import styles from './build-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

const BELT_SIZE: SimpleVec2 = {
  x: 1,
  y: 1,
}

const Axis = z.union([z.literal('x'), z.literal('y')])
type Axis = z.infer<typeof Axis>

export function BuildBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [startingAxis, setStartingAxis] = useStartingAxis()

  const cameraTilePosition = useCameraTilePosition()
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition
  const start = savedStart ?? cameraTilePosition
  const { belts, network } = useBelts(
    context,
    start,
    end,
    startingAxis,
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
          setStartingAxis(startingAxis === 'x' ? 'y' : 'x')
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
  rotation: Rotation,
  turn: BeltTurn,
): Connection[] {
  const connections: Connection[] = []

  if (turn !== BeltTurn.enum.None) {
    // TODO
    return connections
  }

  if (isHorizontal(rotation)) {
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
            multiplier: rotation === 0 ? -1 : 1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
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
            multiplier: rotation === 0 ? 1 : -1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }

    const east =
      context.world.tiles[`${position.x + 1}.${position.y}`]
    if (east?.entityId) {
      const entity = getEntity(context, east.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }

    const west =
      context.world.tiles[`${position.x - 1}.${position.y}`]
    if (west?.entityId) {
      const entity = getEntity(context, west.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isHorizontal(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }
  } else {
    invariant(isVertical(rotation))

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
            multiplier: rotation === 90 ? -1 : 1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
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
            multiplier: rotation === 90 ? 1 : -1,
          })

          break
        }
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier:
                rotation === entity.rotation ? 1 : -1,
            })
          } else {
            // TODO
          }
          break
        }
        default: {
          invariant(false, 'TODO')
        }
      }
    }

    const north =
      context.world.tiles[`${position.x}.${position.y + 1}`]
    if (north?.entityId) {
      const entity = getEntity(context, north.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
        }
      }
    }

    const south =
      context.world.tiles[`${position.x}.${position.y - 1}`]
    if (south?.entityId) {
      const entity = getEntity(context, south.entityId)
      switch (entity.type) {
        case EntityType.enum.Belt: {
          if (isVertical(entity)) {
            // TODO might need to change rotation of existing belts
            //
            // connections.push({
            //   type: ConnectionType.enum.Belt,
            //   entityId: entity.id,
            //   multiplier: 1,
            // })
          } else {
            // TODO
          }
          break
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
  rotation: Rotation,
  turn: BeltTurn,
): void {
  const id = getBeltId(position)
  const connections = getBeltConnections(
    context,
    position,
    rotation,
    turn,
  )
  const prev = belts.at(-1)
  if (prev) {
    prev.connections.push({
      entityId: id,
      multiplier: 1,
      type: ConnectionType.enum.Belt,
    })
    connections.push({
      entityId: prev.id,
      multiplier: 1,
      type: ConnectionType.enum.Belt,
    })
  }

  const mass = 1
  belts.push({
    type: EntityType.enum.Belt,
    id,
    networkId: network.id,
    position,
    size: BELT_SIZE,
    connections,
    offset: 0,
    velocity: 0,
    mass,
    items: [],
    rotation,
    turn,
  })

  invariant(!network.entityIds[id])
  network.entityIds[id] = true
  network.mass += mass
}

function useBelts(
  context: IAppContext,
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
): {
  belts: Belt[]
  network: Network
} {
  const buildVersion = useWorldBuildVersion()
  return useMemo(() => {
    const belts = new Array<Belt>()

    // TODO this doesn't seem super safe assumption
    const rootId = `${start.x}.${start.y}`
    const network: Network = {
      id: rootId,
      entityIds: {},
      mass: 0,
      rootId,
    }

    for (const {
      position,
      rotation,
      turn,
    } of iterateBeltPositions(start, end, startingAxis)) {
      addBelt(
        context,
        network,
        belts,
        position,
        rotation,
        turn,
      )
    }

    return { belts, network }
  }, [context, start, end, startingAxis, buildVersion])
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

function useStartingAxis(): [
  Axis,
  (startingAxis: Axis) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const startingAxis = Axis.parse(
    searchParams.get('startingAxis') ?? 'x',
  )

  const setStartingAxis = useCallback(
    (next: Axis) => {
      setSearchParams(
        (prev) => {
          prev.set('startingAxis', next)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [startingAxis, setStartingAxis]
}

function* iterateBeltPositions(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
) {
  let dx = end ? end.x - start.x : 0
  let dy = end ? end.y - start.y : 0

  if (dx === 0 && dy === 0) {
    if (startingAxis === 'x') {
      dx = 1
    } else {
      invariant(startingAxis === 'y')
      dy = 1
    }
  }

  const sx = Math.sign(dx)
  const sy = Math.sign(dy)

  const iter: {
    position: SimpleVec2
    rotation: Rotation
    turn: BeltTurn
  } = {
    position: null!,
    rotation: null!,
    turn: null!,
  }

  if (startingAxis === 'x') {
    iter.rotation = sx === 1 ? 0 : 180
    iter.turn = BeltTurn.enum.None
    for (let x = 0; x < Math.abs(dx); x++) {
      iter.position = {
        x: start.x + x * sx,
        y: start.y,
      }
      yield iter
    }

    if (dy === 0) return

    let y = 0
    if (dx !== 0) {
      iter.turn =
        sx * sy === 1
          ? BeltTurn.enum.Right
          : BeltTurn.enum.Left
      iter.position = {
        x: start.x + dx,
        y: start.y,
      }
      yield iter
      y += 1
    }

    iter.turn = BeltTurn.enum.None
    iter.rotation = sy === 1 ? 90 : 270

    for (; y <= Math.abs(dy); y++) {
      iter.position = {
        x: start.x + dx,
        y: start.y + y * sy,
      }
      yield iter
    }
  } else {
    invariant(startingAxis === 'y')

    iter.rotation = sy === 1 ? 90 : 270
    iter.turn = BeltTurn.enum.None
    for (let y = 0; y < Math.abs(dy); y++) {
      iter.position = {
        x: start.x,
        y: start.y + y * sy,
      }
      yield iter
    }

    if (dx === 0) return

    let x = 0
    if (dy !== 0) {
      iter.turn =
        sy * sx === 1
          ? BeltTurn.enum.Right
          : BeltTurn.enum.Left
      iter.position = {
        x: start.x,
        y: start.y + dy,
      }
      yield iter
      x += 1
    }

    iter.turn = BeltTurn.enum.None
    iter.rotation = sx === 1 ? 0 : 180

    for (; x <= Math.abs(dx); x++) {
      iter.position = {
        x: start.x + x * sx,
        y: start.y + dy,
      }
      yield iter
    }
  }
}
