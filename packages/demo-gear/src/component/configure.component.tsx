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

function SelectGearBehaviorType({
  behavior,
  setBehavior,
}: {
  behavior: GearBehavior | null
  setBehavior: Dispatch<SetStateAction<GearBehavior | null>>
}) {
  return (
    <fieldset>
      <legend>behavior</legend>
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
    </fieldset>
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
    <>
      <fieldset>
        <legend>Direction</legend>
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
      </fieldset>
    </>
  )
}

function EditFrictionGearBehavior({
  behavior,
}: {
  behavior: FrictionGearBehavior
}) {
  return <>TODO friction</>
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
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      {gearId && (
        <>
          <SelectGearBehaviorType
            behavior={behavior}
            setBehavior={setBehavior}
          />
          {edit}
        </>
      )}
      behavior: {JSON.stringify(behavior)}
    </div>
  )
}
