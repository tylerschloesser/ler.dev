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
  CenterTileIdListener,
  ForceGearBehavior,
  FrictionGearBehavior,
  GearBehavior,
  GearBehaviorType,
  GearId,
  HandType,
  OnChangeGearFn,
} from '../types.js'
import styles from './configure.module.scss'
import { AppContext } from './context.js'
import { GearStats } from './gear-stats.component.js'
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
      <div className={styles['field-label']}>Behavior</div>
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

function EditForceGearBehavior({
  behavior,
  setBehavior,
}: {
  behavior: ForceGearBehavior
  setBehavior: Dispatch<SetStateAction<GearBehavior | null>>
}) {
  return (
    <div>
      <div className={styles['field-label']}>Direction</div>
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
      <div className={styles['field-label']}>Magnitude</div>
      <div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={behavior.magnitude}
          onChange={(e) => {
            setBehavior({
              ...behavior,
              magnitude: parseInt(e.target.value),
            })
          }}
        />
        {behavior.magnitude}
      </div>
      <div className={styles['field-label']}>Governer</div>
      <div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={behavior.governer}
          onChange={(e) => {
            setBehavior({
              ...behavior,
              governer: parseInt(e.target.value),
            })
          }}
        />
        {behavior.governer}
      </div>
    </div>
  )
}

function EditFrictionGearBehavior({
  behavior,
  setBehavior,
}: {
  behavior: FrictionGearBehavior
  setBehavior: Dispatch<SetStateAction<GearBehavior | null>>
}) {
  return (
    <>
      <div className={styles['field-label']}>
        Coeffecient
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={behavior.coeffecient * 10}
          onChange={(e) => {
            setBehavior({
              ...behavior,
              coeffecient: parseInt(e.target.value) / 10,
            })
          }}
        />
        {behavior.coeffecient}
      </div>
      <div className={styles['field-label']}>Magnitude</div>
      <div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={behavior.magnitude}
          onChange={(e) => {
            setBehavior({
              ...behavior,
              magnitude: parseInt(e.target.value),
            })
          }}
        />
        {behavior.magnitude}
      </div>
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
          (tile?.gearId &&
            state.world.gears[tile.gearId]) ||
          null
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
        <EditFrictionGearBehavior
          behavior={behavior}
          setBehavior={setBehavior}
        />
      )
      break
  }

  if (!state) {
    return
  }

  return (
    <>
      {gearId && (
        <Overlay position="top">
          <GearStats state={state} gearId={gearId} />
        </Overlay>
      )}
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
          {gearId && (
            <div className={styles['bottom-main']}>
              <SelectGearBehaviorType
                behavior={behavior}
                setBehavior={setBehavior}
              />
              {edit}
            </div>
          )}
        </div>
      </Overlay>
    </>
  )
}
