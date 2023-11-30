import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { updateAcceleratePosition } from './accelerate.js'
import styles from './accelerate.module.scss'
import { moveCamera } from './camera.js'
import { AppContext } from './context.js'
import { CameraListenerFn, HandType } from './types.js'

export function Accelerate() {
  const navigate = useNavigate()
  const state = use(AppContext)

  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (!state) {
      return
    }

    state.hand = {
      type: HandType.ApplyForce,
      position: null,
      active: false,
      direction: 1,
      gear: null,
      onChangeGear(gear) {
        setDisabled(gear === null)
      },
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    const cameraListener: CameraListenerFn = () => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.ApplyForce)
      updateAcceleratePosition(state, hand, tileX, tileY)
    }
    cameraListener(state)
    state.cameraListeners.add(cameraListener)
    return () => {
      state.hand = null
      state.cameraListeners.delete(cameraListener)
    }
  }, [state])

  if (!state) {
    return
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = true
          hand.direction = -1
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = false
        }}
      >
        -1
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = true
          hand.direction = 1
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = false
        }}
      >
        +1
      </button>
    </div>
  )
}
