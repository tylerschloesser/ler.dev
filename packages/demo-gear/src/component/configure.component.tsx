import { use, useCallback, useEffect } from 'react'
import invariant from 'tiny-invariant'
import {
  CenterTileIdListener,
  HandType,
  OnChangeGearFn,
} from '../types.js'
import styles from './configure.module.scss'
import { AppContext } from './context.js'

export function Configure() {
  const state = use(AppContext)
  const onChangeGear = useCallback<OnChangeGearFn>(
    (gear) => {
      console.log(gear)
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
        const gear =
          state.world.gears[state.centerTileId] ?? null
        invariant(state.hand?.type === HandType.Configure)
        if (state.hand.gear !== gear) {
          state.hand.gear = gear
          onChangeGear(gear)
        }
      }
    state.centerTileIdListeners.add(centerTileIdListener)
    centerTileIdListener(state)

    return () => {
      state.centerTileIdListeners.delete(
        centerTileIdListener,
      )
    }
  }, [state])

  return <div className={styles.container}>TODO</div>
}
