import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'

const MIN_RADIUS = 1
const MAX_RADIUS = 10

export function Delete() {
  const navigate = useNavigate()
  const [radius, setRadius] = useState(MIN_RADIUS)

  invariant(radius >= MIN_RADIUS)
  invariant(radius <= MAX_RADIUS)
  invariant(radius === Math.abs(radius))

  return (
    <Overlay>
      <div className={styles['bottom-container']}>
        <button
          className={styles.button}
          onPointerUp={() => {
            navigate('..')
          }}
        >
          Back
        </button>
        <div className={styles['bottom-main']}>
          <div className={styles['field-label']}>Size</div>
          <input
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step={1}
            value={radius}
            onChange={(e) => {
              setRadius(parseInt(e.target.value))
            }}
          />
        </div>
      </div>
    </Overlay>
  )
}
