import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import {
  AppState,
  GearId,
  TickListenerFn,
} from '../types.js'
import styles from './configure.module.scss'

export function GearStats({
  state,
  gearId,
}: {
  state: AppState
  gearId: GearId
}) {
  const [velocity, setVelocity] = useState<number>(0)
  useTickListener(state, gearId, setVelocity)
  return (
    <div className={styles.stats}>
      Velocity: <pre>{velocity.toFixed(2)}</pre>
    </div>
  )
}

function useTickListener(
  state: AppState,
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
