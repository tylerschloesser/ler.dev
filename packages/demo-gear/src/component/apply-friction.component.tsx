import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { updateApplyFrictionPosition } from '../apply-friction.js'
import { moveCamera } from '../camera.js'
import { CameraListenerFn, HandType } from '../types.js'
import { clamp } from '../util.js'
import styles from './apply-friction.module.scss'
import { AppContext } from './context.js'
import { GearStats } from './gear-stats.component.js'
import { Overlay } from './overlay.component.js'

const COEFFECIENT_SCALE = 0.1

const MIN_COEFFECIENT = 0
const MAX_COEFFECIENT = 10

const COEFFECIENT_STEP = 1

export function ApplyFriction() {
  const navigate = useNavigate()
  const state = use(AppContext)

  const [coeffecient, setCoeffecient] = useState(5)
  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (!state) {
      return
    }

    state.hand = {
      type: HandType.ApplyFriction,
      position: null,
      active: false,
      coeffecient: coeffecient * COEFFECIENT_SCALE,
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
      invariant(hand?.type === HandType.ApplyFriction)
      updateApplyFrictionPosition(state, hand, tileX, tileY)
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
    invariant(state.hand?.type === HandType.ApplyFriction)
    state.hand.coeffecient = coeffecient * COEFFECIENT_SCALE
  }, [state, coeffecient])

  if (!state) {
    return
  }

  let gearId
  if (state.hand) {
    invariant(state.hand.type === HandType.ApplyFriction)
    gearId = state.hand.gear?.id ?? null
  }

  return (
    <>
      {gearId && (
        <Overlay position="top">
          <GearStats state={state} gearId={gearId} />
        </Overlay>
      )}
      <Overlay>
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
          disabled={coeffecient === MIN_COEFFECIENT}
          onPointerUp={() => {
            setCoeffecient((prev) =>
              clamp(
                prev - 1,
                MIN_COEFFECIENT,
                MAX_COEFFECIENT,
              ),
            )
          }}
        >
          -
          {(COEFFECIENT_STEP * COEFFECIENT_SCALE).toFixed(
            1,
          )}
        </button>
        <input
          size={3}
          className={styles.input}
          readOnly
          value={(coeffecient * COEFFECIENT_SCALE).toFixed(
            1,
          )}
        />
        <button
          className={styles.button}
          disabled={coeffecient === MAX_COEFFECIENT}
          onPointerUp={() => {
            setCoeffecient((prev) =>
              clamp(
                prev + 1,
                MIN_COEFFECIENT,
                MAX_COEFFECIENT,
              ),
            )
          }}
        >
          +
          {(COEFFECIENT_STEP * COEFFECIENT_SCALE).toFixed(
            1,
          )}
        </button>
        <button
          disabled={disabled}
          className={styles.button}
          onPointerDown={() => {
            const { hand } = state
            invariant(hand?.type === HandType.ApplyFriction)
            hand.runningEnergyDiff = 0
            hand.active = true
          }}
          onPointerUp={() => {
            const { hand } = state
            invariant(hand?.type === HandType.ApplyFriction)
            hand.active = false
            console.log(
              'energy diff:',
              hand.runningEnergyDiff,
            )
          }}
        >
          Apply
        </button>
      </Overlay>
    </>
  )
}
