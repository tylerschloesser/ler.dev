import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import {
  GearId,
  IAppContext,
  TickListenerFn,
} from '../types.js'
import styles from './gear-stats.module.scss'

export function GearStats({
  context,
  gearId,
}: {
  context: IAppContext
  gearId: GearId
}) {
  const [velocity, setVelocity] = useState<number>(0)
  useTickListener(context, gearId, setVelocity)

  const gear = context.world.gears[gearId]
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
  context: IAppContext,
  gearId: GearId,
  setVelocity: Dispatch<SetStateAction<number>>,
) {
  useEffect(() => {
    const listener: TickListenerFn = () => {
      const gear = context.world.gears[gearId]
      invariant(gear)
      setVelocity(gear.velocity)
    }
    context.tickListeners.add(listener)
    return () => {
      context.tickListeners.delete(listener)
    }
  }, [gearId])
}
