import { useEffect, useState } from 'react'
import { useInputState } from './state.js'
import styles from './toolbar.module.scss'
import { GEAR_SIZES } from './types.js'

export function Toolbar() {
  const inputState = useInputState()
  const [gearSize, setGearSize] = useState<number>(inputState.current.gearSize)

  useEffect(() => {
    inputState.current.gearSize = gearSize
  }, [gearSize])

  return (
    <div className={styles.container}>
      <fieldset>
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
    </div>
  )
}
