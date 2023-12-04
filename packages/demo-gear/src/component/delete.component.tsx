import { use, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { DeleteHand, HandType } from '../types.js'
import { AppContext } from './context.js'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'

const MIN_SIZE = 1
const MAX_SIZE = 10

export function Delete() {
  const navigate = useNavigate()
  const [size, setSize] = useState(MIN_SIZE)

  invariant(size >= MIN_SIZE)
  invariant(size <= MAX_SIZE)
  invariant(size === Math.abs(size))

  const hand = useRef<DeleteHand>({
    type: HandType.Delete,
    size,
  })

  const context = use(AppContext)
  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.size = size
  }, [size])

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
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={1}
            value={size}
            onChange={(e) => {
              setSize(parseInt(e.target.value))
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
