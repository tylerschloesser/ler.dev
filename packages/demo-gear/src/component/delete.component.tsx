import { use, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { DeleteHand, HandType } from '../types.js'
import { AppContext } from './context.js'
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

  const hand = useRef<DeleteHand>({
    type: HandType.Delete,
    radius,
  })

  const context = use(AppContext)
  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.radius = radius
  }, [radius])

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
          <button
            className={styles.button}
            onPointerUp={() => {
              console.log('TODO')
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Overlay>
  )
}
