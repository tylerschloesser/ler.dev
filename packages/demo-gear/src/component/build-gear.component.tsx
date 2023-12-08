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
import { executeBuild } from '../build.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import {
  BuildHand,
  CameraListenerFn,
  Entity,
  EntityId,
  EntityType,
  Gear,
  HandType,
  IAppContext,
  SimpleVec2,
} from '../types.js'
import { clamp, getOverlappingEntities } from '../util.js'
import { Vec2 } from '../vec2.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

const DEFAULT_RADIUS = MIN_RADIUS

export function BuildGear() {
  const context = use(AppContext)
  const [radius, setRadius] = useRadius()
  const center = useGearCenter()
  const chainFrom: Gear | null = null
  const { gear, valid } = useGear(center, radius, chainFrom)

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

function useHand(gear: Gear, valid: boolean): void {
  const context = use(AppContext)

  const hand = useRef<BuildHand>({
    type: HandType.Build,
    chain: null,
    entities: { [gear.id]: gear },
    valid,
    onChangeValid: () => {},
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
  chainFrom: Gear | null,
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
    let chainTo: Gear | undefined
    let attachTo: Gear | undefined

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
          chainTo = found
        } else {
          attachTo = found
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

    // TODO connections
    //
    // TODO validate accelerate map

    return { gear, valid }
  }, [context, center, radius, chainFrom])
}

function getEntity(
  context: IAppContext,
  entityId: EntityId,
): Entity {
  const entity = context.world.entities[entityId]
  invariant(entity)
  return entity
}
