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
import {
  executeBuild,
  initBuild,
  updateBuildPosition,
  updateRadius,
} from '../build.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import {
  CameraListenerFn,
  Entity,
  EntityId,
  EntityType,
  Gear,
  HandType,
  SimpleVec2,
} from '../types.js'
import { clamp } from '../util.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

const DEFAULT_RADIUS = MIN_RADIUS

export function BuildGear() {
  const context = use(AppContext)
  const [radius, setRadius] = useRadius()
  const center = useGearCenter()
  const { gear } = useGear(center, radius)

  const [valid, setValid] = useState(false)

  useEffect(() => {
    initBuild(context, radius, setValid)

    const cameraListener: CameraListenerFn = () => {
      invariant(context.hand?.type === HandType.Build)
      updateBuildPosition(context, context.hand)
    }
    context.cameraListeners.add(cameraListener)

    return () => {
      context.hand = null
      context.cameraListeners.delete(cameraListener)
    }
  }, [context])

  useEffect(() => {
    updateRadius(context, radius)
  }, [context, radius])

  const navigate = useNavigate()

  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Cancel
      </button>
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
          const { hand } = context
          invariant(hand?.type === HandType.Build)
          executeBuild(context, hand)
        }}
      >
        Build
      </button>
    </Overlay>
  )
}

function useHand(
  entities: Record<EntityId, Entity>,
  valid: boolean,
): void {
  const context = use(AppContext)
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

function useGearCenter(): SimpleVec2 {
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
): { gear: Gear; valid: boolean } {
  const context = use(AppContext)

  return useMemo(() => {
    const position: SimpleVec2 = {
      x: center.x - radius,
      y: center.y - radius,
    }

    const gear: Gear = {
      id: `${position.x}.${position.y}`,
      type: EntityType.enum.Gear,
      position,
      center,
      angle: 0,
      connections: [],
      mass: Math.PI * radius ** 2,
      radius,
      velocity: 0,
    }

    let valid: boolean = true

    return { gear, valid }
  }, [context, center, radius])
}
