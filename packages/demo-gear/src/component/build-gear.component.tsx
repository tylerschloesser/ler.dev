import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { getAccelerationMap } from '../apply-torque.js'
import { addConnection, build } from '../build.js'
import {
  GEAR_RADIUSES,
  MAX_RADIUS,
  MIN_RADIUS,
} from '../const.js'
import {
  BuildHand,
  CameraListenerFn,
  Connection,
  ConnectionType,
  Entity,
  EntityId,
  EntityType,
  Gear,
  HandType,
  IAppContext,
  Network,
  NetworkId,
  SimpleVec2,
  World,
} from '../types.js'
import {
  clamp,
  getEntity,
  getIntersectingEntities,
  isHorizontal,
  isVertical,
} from '../util.js'
import { Vec2 } from '../vec2.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

const DEFAULT_RADIUS = MIN_RADIUS

const RADIUS_TO_SIZE = GEAR_RADIUSES.reduce<
  Record<number, SimpleVec2>
>(
  (acc, r) => ({
    ...acc,
    [r]: { x: r * 2, y: r * 2 },
  }),
  {},
)

enum ActionType {
  Chain = 'chain',
  Attach = 'attach',
  Build = 'build',
}

interface ChainAction {
  type: ActionType.Chain
  target: Gear
}

interface AttachAction {
  type: ActionType.Attach
}

interface BuildAction {
  type: ActionType.Build
}

type Action = ChainAction | AttachAction | BuildAction

export function BuildGear() {
  const context = use(AppContext)
  const [radius, setRadius] = useRadius()
  const center = useCenter()
  const [chainFrom, setChainFrom] = useChainFrom()
  const { entities, networks, valid, action } = useEntities(
    center,
    radius,
    chainFrom,
  )

  const hand = useHand(entities, networks, valid)

  const navigate = useNavigate()

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
      {chainFrom && (
        <button
          className={styles.button}
          onPointerUp={() => {
            setChainFrom(null)
          }}
        >
          Cancel
        </button>
      )}
      <button
        className={styles.button}
        disabled={radius === MIN_RADIUS}
        onPointerUp={() => {
          setRadius(
            clamp(radius - 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &darr;
      </button>
      <input
        className={styles.input}
        readOnly
        size={1}
        value={radius}
      />
      <button
        className={styles.button}
        disabled={radius === MAX_RADIUS}
        onPointerUp={() => {
          setRadius(
            clamp(radius + 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &uarr;
      </button>
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return
          switch (action.type) {
            case ActionType.Chain: {
              if (!chainFrom) {
                setChainFrom(action.target)
              } else {
                addConnection(
                  context,
                  chainFrom,
                  action.target,
                  {
                    type: ConnectionType.enum.Chain,
                    entityId: action.target.id,
                    multiplier: 1,
                  },
                )
                setChainFrom(null)
              }
              break
            }
            case ActionType.Attach:
            case ActionType.Build: {
              build(context, hand)
              setChainFrom(null)
              break
            }
          }
        }}
      >
        {action.type === ActionType.Build && 'Build'}
        {action.type === ActionType.Chain && 'Chain'}
        {action.type === ActionType.Attach && 'Attach'}
      </button>
    </Overlay>
  )
}

function useHand(
  entities: World['entities'],
  networks: World['networks'],
  valid: boolean,
): BuildHand {
  const context = use(AppContext)

  const hand = useMemo<BuildHand>(
    () => ({
      type: HandType.Build,
      entities,
      networks,
      valid,
    }),
    [entities, networks, valid],
  )

  useEffect(() => {
    context.hand = hand
    return () => {
      context.hand = null
    }
  }, [hand])

  return hand
}

function useRadius(): [number, (radius: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const radius = parseInt(
    searchParams.get('radius') ?? `${DEFAULT_RADIUS}`,
  )
  invariant(radius >= MIN_RADIUS)
  invariant(radius <= MAX_RADIUS)
  invariant(radius === Math.min(radius))
  const setRadius = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          prev.set('radius', `${next}`)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )
  return [radius, setRadius]
}

function useCenter(): SimpleVec2 {
  const context = use(AppContext)
  const [center, setCenter] = useState<SimpleVec2>({
    x: Math.round(context.camera.position.x),
    y: Math.round(context.camera.position.y),
  })

  useEffect(() => {
    const listener: CameraListenerFn = () => {
      const x = Math.floor(context.camera.position.x)
      const y = Math.floor(context.camera.position.y)
      setCenter((prev) => {
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

  return center
}

function useEntities(
  center: SimpleVec2,
  radius: number,
  chainFrom: Gear | null,
): {
  entities: World['entities']
  networks: World['networks']
  valid: boolean
  action: Action
} {
  const context = use(AppContext)
  const buildVersion = useWorldBuildVersion()

  return useMemo(() => {
    const position: SimpleVec2 = {
      x: center.x - radius,
      y: center.y - radius,
    }

    const connections = new Array<Connection>()

    let valid: boolean = true
    let chain: Gear | undefined
    let attach: Gear | undefined

    const intersecting = getIntersectingEntities(
      context,
      position.x,
      position.y,
      radius * 2,
      radius * 2,
    )

    if (intersecting.length > 1) {
      valid = false
    } else if (intersecting.length === 1) {
      const found = intersecting.at(0)
      invariant(found)
      if (
        found.type === EntityType.enum.Gear &&
        Vec2.equal(found.center, center) &&
        (found.radius === 1 || radius === 1)
      ) {
        if (found.radius === 1 && radius === 1) {
          chain = found
        } else {
          attach = found
        }
      } else {
        valid = false
      }
    }

    if (valid && chainFrom) {
      const dx = center.x - chainFrom.center.x
      const dy = center.y - chainFrom.center.y
      valid =
        (dx === 0 || dy === 0) &&
        dx !== dy &&
        Math.abs(dx + dy) > radius + chainFrom.radius
    }

    if (valid && !chain) {
      // TODO clean this up
      // don't add connections for chain
      // chain connections are copied, then we manually add the chain
      // connection if needed
      connections.push(
        ...getConnections(
          context,
          position,
          center,
          radius,
        ),
      )
      if (chainFrom) {
        connections.push({
          type: ConnectionType.enum.Chain,
          entityId: chainFrom.id,
          multiplier: 1,
        })
      }
      if (attach) {
        connections.push({
          type: ConnectionType.enum.Attach,
          entityId: attach.id,
          multiplier: attach.radius / radius,
        })
      }
    }

    let action: Action
    invariant(!(chain && attach))
    if (chain) {
      action = { type: ActionType.Chain, target: chain }
    } else if (attach) {
      action = { type: ActionType.Attach }
    } else {
      action = { type: ActionType.Build }
    }

    const id: EntityId = `${position.x}.${position.y}`
    const networkId: NetworkId = id

    let gear: Gear
    if (chain) {
      gear = cloneGear(chain)
      gear.networkId = networkId
      if (chainFrom) {
        gear.connections.push({
          type: ConnectionType.enum.Chain,
          entityId: chainFrom.id,
          multiplier: 1,
        })
      }
    } else {
      const size = RADIUS_TO_SIZE[radius]
      invariant(size)
      gear = {
        id,
        type: EntityType.enum.Gear,
        networkId,
        position,
        size,
        center,
        angle: chainFrom?.angle ?? 0,
        connections,
        mass: Math.PI * radius ** 2,
        radius,
        velocity: 0,
      }
    }

    const entities = {
      [gear.id]: gear,
    }

    if (chainFrom) {
      const chainFromClone = cloneGear(chainFrom)
      chainFromClone.networkId = networkId
      chainFromClone.connections.push({
        type: ConnectionType.enum.Chain,
        entityId: gear.id,
        multiplier: 1,
      })
      entities[chainFrom.id] = chainFromClone
    }

    if (valid) {
      valid =
        getAccelerationMap(gear, 1, {
          ...context.world.entities,
          ...entities,
        }) !== null
    }

    const network: Network = {
      id: networkId,
      entityIds: {},
      rootId: gear.id,
      mass: 0,
    }
    for (const entity of Object.values(entities)) {
      network.entityIds[entity.id] = true
      network.mass += entity.mass
    }
    invariant(network.entityIds[network.rootId])
    const networks = {
      [network.id]: network,
    }

    return { entities, networks, valid, action }
  }, [context, center, radius, chainFrom, buildVersion])
}

function useChainFrom(): [
  Gear | null,
  setChainFrom: (chainFrom: Gear | null) => void,
] {
  const context = use(AppContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const chainFromId = searchParams.get('chainFrom')
  let chainFrom: Gear | null = null
  if (chainFromId) {
    const entity = context.world.entities[chainFromId]
    invariant(entity?.type === EntityType.enum.Gear)
    chainFrom = entity
  }
  const setChainFrom = useCallback(
    (next: Gear | null) => {
      setSearchParams(
        (prev) => {
          if (next === null) {
            prev.delete('chainFrom')
          } else {
            prev.set('chainFrom', next.id)
          }
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )
  return [chainFrom, setChainFrom]
}

enum Direction {
  N = 'north',
  S = 'south',
  E = 'east',
  W = 'west',
}

function getConnections(
  context: IAppContext,
  position: SimpleVec2,
  center: SimpleVec2,
  radius: number,
): Connection[] {
  const connections: Connection[] = []
  const seen = new Set<Entity>()

  for (const direction of Object.values(Direction)) {
    for (let i = 0; i < 2; i++) {
      let dx: number, dy: number
      switch (direction) {
        case Direction.N: {
          dx = radius - 1 + i
          dy = -1
          break
        }
        case Direction.S: {
          dx = radius - 1 + i
          dy = radius * 2
          break
        }
        case Direction.E: {
          dx = radius * 2
          dy = radius - 1 + i
          break
        }
        case Direction.W: {
          dx = -1
          dy = radius - 1 + i
          break
        }
      }

      const tileId = `${position.x + dx}.${position.y + dy}`
      const tile = context.world.tiles[tileId]
      if (!tile?.entityId) continue
      const entity = getEntity(context, tile.entityId)

      if (seen.has(entity)) continue
      seen.add(entity)

      switch (entity.type) {
        case EntityType.enum.Gear: {
          let connected: boolean = false
          switch (direction) {
            case Direction.N: {
              connected =
                center.x === entity.center.x &&
                center.y - (radius + entity.radius) ===
                  entity.center.y
              break
            }
            case Direction.S: {
              connected =
                center.x === entity.center.x &&
                center.y + (radius + entity.radius) ===
                  entity.center.y
              break
            }
            case Direction.E: {
              connected =
                center.y === entity.center.y &&
                center.x + (radius + entity.radius) ===
                  entity.center.x
              break
            }
            case Direction.W: {
              connected =
                center.y === entity.center.y &&
                center.x - (radius + entity.radius) ===
                  entity.center.x
              break
            }
          }
          if (connected) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier: -1,
            })
          }
          break
        }
        case EntityType.enum.Belt: {
          let multiplier: number | null = null
          switch (direction) {
            case Direction.N: {
              if (isVertical(entity)) break
              multiplier = entity.rotation === 0 ? 1 : -1
              break
            }
            case Direction.S: {
              if (isVertical(entity)) break
              multiplier = entity.rotation === 0 ? -1 : 1
              break
            }
            case Direction.E: {
              if (isHorizontal(entity)) break
              multiplier = entity.rotation === 90 ? 1 : -1
              break
            }
            case Direction.W: {
              if (isHorizontal(entity)) break
              multiplier = entity.rotation === 90 ? -1 : 1
              break
            }
          }
          if (multiplier !== null) {
            connections.push({
              type: ConnectionType.enum.Adjacent,
              entityId: entity.id,
              multiplier,
            })
          }
          break
        }
      }
    }
  }
  return connections
}

function cloneGear(gear: Gear): Gear {
  return {
    ...gear,
    connections: [...gear.connections],
    behavior: gear.behavior && {
      ...gear.behavior,
    },
  }
}
