import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import styles from './add-gear.module.scss'
import {
  executeBuild,
  updateBuild,
  updateBuildPosition,
} from './build.js'
import { moveCamera } from './camera.js'
import { MAX_RADIUS, MIN_RADIUS } from './const.js'
import { AppContext } from './context.js'
import { CameraListenerFn, HandType } from './types.js'
import { clamp } from './util.js'

export function AddGear() {
  const state = use(AppContext)
  const [radius, setRadius] = useState(1)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!state) {
      return
    }

    state.hand = {
      type: HandType.Build,
      chain: null,
      gear: null,
      radius,
      valid: false,
      onChangeValid: setValid,
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    const cameraListener: CameraListenerFn = () => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.Build)
      updateBuildPosition(state, hand, tileX, tileY)
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
    if (state.hand?.type === HandType.Build) {
      state.hand.radius = radius
      updateBuild(state, state.hand)
    }
  }, [state, radius])

  const navigate = useNavigate()

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
        Cancel
      </button>
      <button
        className={styles.button}
        disabled={radius === MIN_RADIUS}
        onPointerUp={() => {
          setRadius((prev) =>
            clamp(prev - 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &darr;
      </button>
      <input
        className={styles.input}
        readOnly
        value={radius}
      />
      <button
        className={styles.button}
        disabled={radius === MAX_RADIUS}
        onPointerUp={() => {
          setRadius((prev) =>
            clamp(prev + 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &uarr;
      </button>
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Build)
          executeBuild(state, hand)
        }}
      >
        Build
      </button>
    </div>
  )
}
