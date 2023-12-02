import {
  Dispatch,
  SetStateAction,
  use,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  AppState,
  CenterTileIdListener,
  ForceGearBehavior,
  FrictionGearBehavior,
  GearBehavior,
  GearBehaviorType,
  GearId,
  HandType,
  OnChangeGearFn,
  TickListenerFn,
} from '../types.js'
import styles from './configure.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

function SelectGearBehaviorType({
  behavior,
  setBehavior,
}: {
  behavior: GearBehavior | null
  setBehavior: Dispatch<SetStateAction<GearBehavior | null>>
}) {
  return (
    <div>
      <div className={styles['radio-group-label']}>
        Behavior
      </div>
      <div>
        <label>
          <input
            type="radio"
            value=""
            checked={behavior === null}
            onChange={() => {
              setBehavior(null)
            }}
          />
          None
        </label>
        <label>
          <input
            type="radio"
            value={GearBehaviorType.enum.Force}
            checked={
              behavior?.type === GearBehaviorType.enum.Force
            }
            onChange={() => {
              setBehavior({
                type: GearBehaviorType.enum.Force,
                direction: 'cw',
                magnitude: 1,
                governer: 10,
              })
            }}
          />
          Force
        </label>
        <label>
          <input
            type="radio"
            value={GearBehaviorType.enum.Friction}
            checked={
              behavior?.type ===
              GearBehaviorType.enum.Friction
            }
            onChange={() => {
              setBehavior({
                type: GearBehaviorType.enum.Friction,
                coeffecient: 0.5,
                magnitude: 1,
              })
            }}
          />
          Friction
        </label>
      </div>
    </div>
  )
}

function GearStats({
  state,
  gearId,
}: {
  state: AppState
  gearId: GearId
}) {
  const [velocity, setVelocity] = useState<number>(0)

  useEffect(() => {
    const listener: TickListenerFn = () => {
      const gear = state.world.gears[gearId]
      invariant(gear)
      setVelocity(gear.velocity)
    }
    state.tickListeners.add(listener)
    return () => {
      state.tickListeners.delete(listener)
    }
  }, [])

  return <>Velocity: {velocity.toFixed(2)}</>
}

function EditForceGearBehavior({
  behavior,
  setBehavior,
}: {
  behavior: ForceGearBehavior
  setBehavior: Dispatch<SetStateAction<GearBehavior | null>>
}) {
  return (
    <div>
      <div className={styles['radio-group-label']}>
        Direction
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="cw"
            checked={behavior.direction === 'cw'}
            onChange={() => {
              setBehavior({
                ...behavior,
                direction: 'cw',
              })
            }}
          />
          CW
        </label>
        <label>
          <input
            type="radio"
            value="ccw"
            checked={behavior.direction === 'ccw'}
            onChange={() => {
              setBehavior({
                ...behavior,
                direction: 'ccw',
              })
            }}
          />
          CCW
        </label>
      </div>
      <label>
        Magnitude
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          size={2}
          value={behavior.magnitude}
          onChange={(e) => {
            setBehavior({
              ...behavior,
              magnitude: parseInt(e.target.value),
            })
          }}
        />
      </label>
    </div>
  )
}

function EditFrictionGearBehavior({
  behavior,
}: {
  behavior: FrictionGearBehavior
}) {
  return (
    <>
      <input
        className={styles.input}
        type="number"
        min={0}
        max={1}
        step={0.1}
        size={4}
      />
    </>
  )
}

export function Configure() {
  const state = use(AppContext)
  const navigate = useNavigate()
  const [gearId, setGearId] = useState<GearId | null>(null)
  const [behavior, setBehavior] =
    useState<GearBehavior | null>(null)

  const onChangeGear = useCallback<OnChangeGearFn>(
    (gear) => {
      setGearId(gear?.id ?? null)
      setBehavior(gear?.behavior ?? null)
    },
    [state],
  )

  useEffect(() => {
    if (!state || !gearId) {
      return
    }
    const gear = state.world.gears[gearId]
    invariant(gear)
    if (behavior === null) {
      delete gear.behavior
    } else {
      gear.behavior = behavior
    }
  }, [gearId, behavior])

  useEffect(() => {
    if (!state) {
      return
    }

    state.hand = {
      type: HandType.Configure,
      gear: null,
      onChangeGear,
    }

    const centerTileIdListener: CenterTileIdListener =
      () => {
        const tile = state.world.tiles[state.centerTileId]
        const gear =
          (tile && state.world.gears[tile.gearId]) ?? null
        invariant(state.hand?.type === HandType.Configure)
        if (state.hand.gear !== gear) {
          state.hand.gear = gear
          onChangeGear(gear)
        }
      }
    state.centerTileIdListeners.add(centerTileIdListener)
    centerTileIdListener(state)

    return () => {
      state.hand = null
      state.centerTileIdListeners.delete(
        centerTileIdListener,
      )
    }
  }, [state])

  let edit = null
  switch (behavior?.type) {
    case GearBehaviorType.enum.Force:
      edit = (
        <EditForceGearBehavior
          behavior={behavior}
          setBehavior={setBehavior}
        />
      )
      break
    case GearBehaviorType.enum.Friction:
      edit = (
        <EditFrictionGearBehavior behavior={behavior} />
      )
      break
  }

  return (
    <>
      <Overlay position="top">
        {gearId && state && (
          <GearStats state={state} gearId={gearId} />
        )}
        <pre>{JSON.stringify(behavior)}</pre>
      </Overlay>
      <Overlay position="bottom">
        <div className={styles['bottom-container']}>
          <button
            className={styles.button}
            onPointerUp={() => {
              navigate('..')
            }}
          >
            Back
          </button>
          <div className={styles['bottom-main']}>
            {gearId && (
              <>
                <SelectGearBehaviorType
                  behavior={behavior}
                  setBehavior={setBehavior}
                />
              </>
            )}
            {edit}
          </div>
        </div>
      </Overlay>
    </>
  )
}
