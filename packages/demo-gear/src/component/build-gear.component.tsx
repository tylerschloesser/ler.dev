import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from '../add-gear.js'
import { getAccelerationMap } from '../apply-torque.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import {
  BuildHand,
  CameraListenerFn,
  Connection,
  ConnectionType,
  EntityType,
  Gear,
  HandType,
  SimpleVec2,
} from '../types.js'
import {
  clamp,
  getAdjacentConnections,
  getOverlappingEntities,
} from '../util.js'
import { Vec2 } from '../vec2.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

const DEFAULT_RADIUS = MIN_RADIUS

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
  target: Gear
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
  const { gear, valid, action } = useGear(
    center,
    radius,
    chainFrom,
  )

  useHand(gear, valid)

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
          switch (action.type) {
            case ActionType.Chain: {
              if (!chainFrom) {
                setChainFrom(action.target)
              } else {
                addChainConnection(
                  chainFrom,
                  action.target,
                  context,
                )
                setChainFrom(null)
              }
              break
            }
            case ActionType.Attach: {
              addGear(gear, context)
              setChainFrom(null)
              break
            }
            case ActionType.Build: {
              addGear(gear, context)
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

function useHand(gear: Gear, valid: boolean): void {
  const context = use(AppContext)

  const hand = useRef<BuildHand>({
    type: HandType.Build,
    entities: { [gear.id]: gear },
    valid,
  })

  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.entities = { [gear.id]: gear }
    hand.current.valid = valid
  }, [gear, valid])
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

function useGear(
  center: SimpleVec2,
  radius: number,
  chainFrom: Gear | null,
): { gear: Gear; valid: boolean; action: Action } {
  const context = use(AppContext)
  const buildVersion = useWorldBuildVersion()

  return useMemo(() => {
    const position: SimpleVec2 = {
      x: center.x - radius,
      y: center.y - radius,
    }

    const connections = new Array<Connection>()

    const gear: Gear = {
      id: `${position.x}.${position.y}`,
      type: EntityType.enum.Gear,
      position,
      center,
      angle: chainFrom?.angle ?? 0,
      connections,
      mass: Math.PI * radius ** 2,
      radius,
      velocity: 0,
    }

    let valid: boolean = true
    let chain: Gear | undefined
    let attach: Gear | undefined

    const overlapping = getOverlappingEntities(
      context,
      gear,
    )
    if (overlapping.length > 1) {
      valid = false
    } else if (overlapping.length === 1) {
      const found = overlapping.at(0)
      invariant(found)
      if (
        found.type === EntityType.enum.Gear &&
        Vec2.equal(found.center, gear.center) &&
        (found.radius === 1 || gear.radius === 1)
      ) {
        if (found.radius === 1 && gear.radius === 1) {
          chain = found
        } else {
          attach = found
        }
      } else {
        valid = false
      }
    }

    if (valid && chainFrom) {
      const dx = gear.center.x - chainFrom.center.x
      const dy = gear.center.y - chainFrom.center.y
      valid =
        (dx === 0 || dy === 0) &&
        dx !== dy &&
        Math.abs(dx + dy) > gear.radius + chainFrom.radius
    }

    if (valid) {
      connections.push(
        ...getAdjacentConnections(
          center,
          radius,
          context.world,
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
          multiplier: 1,
        })
      }
    }

    if (valid) {
      valid =
        getAccelerationMap(
          gear,
          1,
          context.world.entities,
        ) !== null
    }

    let action: Action
    invariant(!(chain && attach))
    if (chain) {
      action = { type: ActionType.Chain, target: chain }
    } else if (attach) {
      action = { type: ActionType.Attach, target: attach }
    } else {
      action = { type: ActionType.Build }
    }

    return { gear, valid, action }
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
