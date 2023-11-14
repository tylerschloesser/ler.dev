import { useEffect, useState } from 'react'
import { useInputState } from './state.js'
import styles from './toolbar.module.scss'
import { GEAR_SIZES, PointerMode } from './types.js'

export function Toolbar() {
  const { inputState, saveInputState } = useInputState()
  const [gearSize, setGearSize] = useState<number>(inputState.current.gearSize)
  const [pointerMode, setPointerMode] = useState<PointerMode>(
    inputState.current.pointerMode,
  )
  const [acceleration, setAcceleration] = useState<number>(
    inputState.current.acceleration,
  )

  useEffect(() => {
    inputState.current.gearSize = gearSize
    inputState.current.pointerMode = pointerMode
    inputState.current.acceleration = acceleration
    saveInputState()
  }, [gearSize, pointerMode, acceleration])

  return (
    <div className={styles.container}>
      <div>
        <div>Add Gear:</div>
        {GEAR_SIZES.map((size) => (
          <button
            key={size}
            onPointerUp={() => {
              setGearSize(size)
              setPointerMode(PointerMode.AddGear)
            }}
          >
            {size}
          </button>
        ))}
      </div>
      <div>
        <div>Accelerate:</div>
        {[1, -1].map((acceleration) => (
          <button
            key={acceleration}
            onPointerUp={() => {
              setAcceleration(acceleration)
              setPointerMode(PointerMode.ApplyForce)
            }}
          >
            {acceleration}
          </button>
        ))}
      </div>
    </div>
  )
}
