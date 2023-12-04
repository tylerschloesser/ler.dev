import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import {
  IAppContext,
  GearId,
  TickListenerFn,
} from '../types.js'
import styles from './gear-stats.module.scss'

export function GearStats({
  state,
  gearId,
}: {
  state: IAppContext
  gearId: GearId
}) {
  const [velocity, setVelocity] = useState<number>(0)
  useTickListener(state, gearId, setVelocity)

  const gear = state.world.gears[gearId]
  invariant(gear)

  return (
    <div className={styles.stats}>
      <div>
        <span className={styles.key}>{'Mass: '}</span>
        <span className={styles.value}>
          {gear.mass.toFixed(2)}
        </span>
      </div>
      <span className={styles.divider}>|</span>
      <div>
        <span className={styles.key}>Velocity: </span>
        <span className={styles.value}>
          {velocity.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

function useTickListener(
  state: IAppContext,
  gearId: GearId,
  setVelocity: Dispatch<SetStateAction<number>>,
) {
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
  }, [gearId])
}
