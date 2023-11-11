import { useEffect, useState } from 'react'
import { useInputState } from './state.js'
import styles from './toolbar.module.scss'
import { GEAR_SIZES, PointerMode } from './types.js'

export function Toolbar() {
  const inputState = useInputState()
  const [gearSize, setGearSize] = useState<number>(inputState.current.gearSize)
  const [pointerMode, setPointerMode] = useState<PointerMode>(
    PointerMode.AddGear,
  )

  useEffect(() => {
    inputState.current.gearSize = gearSize
    inputState.current.pointerMode = pointerMode
  }, [gearSize, pointerMode])

  return (
    <div className={styles.container}>
      <fieldset>
        <legend>Gear Size:</legend>
        {GEAR_SIZES.map((value) => (
          <label key={value}>
            {value}
            <input
              type="radio"
              checked={gearSize === value}
              onChange={() => setGearSize(value)}
            />
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Pointer Mode:</legend>
        {Object.values(PointerMode).map((value) => (
          <label key={value}>
            {value}
            <input
              type="radio"
              checked={pointerMode === value}
              onChange={() => setPointerMode(value)}
            />
          </label>
        ))}
      </fieldset>
    </div>
  )
}
