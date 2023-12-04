import { use, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CameraListenerFn,
  DeleteHand,
  HandType,
  SimpleVec2,
} from '../types.js'
import { AppContext } from './context.js'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'

const MIN_SIZE = 1
const MAX_SIZE = 10

function useHandPosition(size: number): SimpleVec2 {
  const context = use(AppContext)
  const [position, setPosition] = useState<SimpleVec2>({
    x: 0,
    y: 0,
  })
  useEffect(() => {
    const listener: CameraListenerFn = () => {
      const x = Math.round(
        context.camera.position.x - size / 2,
      )
      const y = Math.round(
        context.camera.position.y - size / 2,
      )
      setPosition((prev) => {
        if (prev.x === x && prev.y === y) {
          return prev
        }
        return { x, y }
      })
    }
    context.cameraListeners.add(listener)
    listener(context)
    return () => {
      context.cameraListeners.delete(listener)
    }
  }, [size])
  return position
}

export function Delete() {
  const navigate = useNavigate()
  const [size, setSize] = useState(MIN_SIZE)

  invariant(size >= MIN_SIZE)
  invariant(size <= MAX_SIZE)
  invariant(size === Math.abs(size))

  const position = useHandPosition(size)

  const hand = useRef<DeleteHand>({
    type: HandType.Delete,
    position,
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
    hand.current.position = position
  }, [size, position])

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
