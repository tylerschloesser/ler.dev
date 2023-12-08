import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  executeBuild,
  initBuild,
  updateBuildPosition,
  updateRadius,
} from '../build.js'
import { MAX_RADIUS, MIN_RADIUS } from '../const.js'
import { CameraListenerFn, HandType } from '../types.js'
import { clamp } from '../util.js'
import styles from './build-gear.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddGear() {
  const context = use(AppContext)
  const [radius, setRadius] = useState(1)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    initBuild(context, radius, setValid)

    const cameraListener: CameraListenerFn = () => {
      invariant(context.hand?.type === HandType.Build)
      updateBuildPosition(context, context.hand)
    }
    context.cameraListeners.add(cameraListener)

    return () => {
      context.hand = null
      context.cameraListeners.delete(cameraListener)
    }
  }, [context])

  useEffect(() => {
    updateRadius(context, radius)
  }, [context, radius])

  const navigate = useNavigate()

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
          const { hand } = context
          invariant(hand?.type === HandType.Build)
          executeBuild(context, hand)
        }}
      >
        Build
      </button>
    </Overlay>
  )
}
