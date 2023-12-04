import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  executeBuild,
  initBuild,
  updateBuildPosition,
  updateRadius,
} from '../build.js'
import { moveCamera } from '../camera.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import { CameraListenerFn, HandType } from '../types.js'
import { clamp } from '../util.js'
import styles from './add-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddGear() {
  const state = use(AppContext)
  const [radius, setRadius] = useState(1)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!state) {
      return
    }

    initBuild(state, radius, setValid)

    const cameraListener: CameraListenerFn = () => {
      invariant(state.hand?.type === HandType.Build)
      updateBuildPosition(state, state.hand)
    }
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
    updateRadius(state, radius)
  }, [state, radius])

  const navigate = useNavigate()

  if (!state) {
    return
  }

  return (
    <Overlay>
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
        size={1}
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
    </Overlay>
  )
}
