import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { updateApplyForcePosition } from './apply-force.js'
import styles from './apply-force.module.scss'
import { moveCamera } from './camera.js'
import { AppContext } from './context.js'
import { CameraListenerFn, HandType } from './types.js'
import { clamp } from './util.js'

const MIN_MAGNITUDE = 1
const MAX_MAGNITUDE = 1000

export function ApplyForce() {
  const navigate = useNavigate()
  const state = use(AppContext)

  const [magnitude, setMagnitude] = useState(1)
  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (!state) {
      return
    }

    state.hand = {
      type: HandType.ApplyForce,
      position: null,
      active: false,
      direction: 'cw',
      magnitude,
      gear: null,
      onChangeGear(gear) {
        setDisabled(gear === null)
      },
      runningEnergyDiff: 0,
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    const cameraListener: CameraListenerFn = () => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.ApplyForce)
      updateApplyForcePosition(state, hand, tileX, tileY)
    }
    cameraListener(state)
    state.cameraListeners.add(cameraListener)
    return () => {
      state.hand = null
      state.cameraListeners.delete(cameraListener)
    }
  }, [state])

  useEffect(() => {
    if (!state) {
      return
    }
    invariant(state.hand?.type === HandType.ApplyForce)
    state.hand.magnitude = magnitude
  }, [state, magnitude])

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
        className={styles.button}
        disabled={magnitude === MIN_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev - 100, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        -100
      </button>
      <button
        className={styles.button}
        disabled={magnitude === MIN_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev - 10, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        -10
      </button>
      <button
        className={styles.button}
        disabled={magnitude === MIN_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev - 1, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        -1
      </button>
      <input
        size={4}
        className={styles.input}
        readOnly
        value={magnitude}
      />
      <button
        className={styles.button}
        disabled={magnitude === MAX_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev + 1, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        +1
      </button>
      <button
        className={styles.button}
        disabled={magnitude === MAX_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev + 10, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        +10
      </button>
      <button
        className={styles.button}
        disabled={magnitude === MAX_MAGNITUDE}
        onPointerUp={() => {
          setMagnitude((prev) =>
            clamp(prev + 100, MIN_MAGNITUDE, MAX_MAGNITUDE),
          )
        }}
      >
        +100
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = true
          hand.direction = 'ccw'
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = false
        }}
      >
        CCW
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = true
          hand.direction = 'cw'
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.ApplyForce)
          hand.active = false
        }}
      >
        CW
      </button>
    </div>
  )
}
