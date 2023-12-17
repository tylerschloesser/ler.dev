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
import { getBuildHand } from '../build-gear.js'
import { addConnection, build } from '../build.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import {
  ActionType,
  BuildHand,
  CameraListenerFn,
  ConnectionType,
  EntityType,
  Gear,
  SimpleVec2,
} from '../types.js'
import { clamp, incrementBuildVersion } from '../util.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

const DEFAULT_RADIUS = MIN_RADIUS

export function BuildGear() {
  const context = use(AppContext)
  const [radius, setRadius] = useRadius()
  const center = useCenter()
  const [chainFrom, setChainFrom] = useChainFrom()
  const hand = useHand(center, radius, chainFrom)
  const { valid, action } = hand
  invariant(action) // TODO shouldn't have to do this

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
              build(context.world, hand)
              hand.entities = {}
              incrementBuildVersion(context)
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
  center: SimpleVec2,
  radius: number,
  chainFrom: Gear | null,
): BuildHand {
  const context = use(AppContext)
  const buildVersion = useWorldBuildVersion()

  const hand = useMemo<BuildHand>(
    () =>
      getBuildHand(
        context.world,
        center,
        radius,
        chainFrom,
      ),
    [context, buildVersion, center, radius, chainFrom],
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
