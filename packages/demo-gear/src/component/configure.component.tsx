import {
  use,
  useCallback,
  useEffect,
  useState,
} from 'react'
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

function EditForceGearBehavior({
  behavior,
}: {
  behavior: ForceGearBehavior
}) {
  return <>TODO force</>
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
      edit = <EditForceGearBehavior behavior={behavior} />
      break
    case GearBehaviorType.enum.Friction:
      edit = (
        <EditFrictionGearBehavior behavior={behavior} />
      )
      break
  }

  return (
    <div className={styles.container}>
      {gearId} behavior: {JSON.stringify(behavior)}
      {edit}
    </div>
  )
}
