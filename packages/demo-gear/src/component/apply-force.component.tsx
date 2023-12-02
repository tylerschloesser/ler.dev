import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { updateApplyForcePosition } from '../apply-force.js'
import { moveCamera } from '../camera.js'
import { CameraListenerFn, HandType } from '../types.js'
import styles from './apply-force.module.scss'
import { AppContext } from './context.js'
import { GearStats } from './gear-stats.component.js'
import { Overlay } from './overlay.component.js'

const INITIAL_MAGNITUDE = 10
const MIN_MAGNITUDE = 0
const MAX_MAGNITUDE = 1000

export function ApplyForce() {
  const navigate = useNavigate()
  const state = use(AppContext)

  const [magnitude, setMagnitude] = useState(
    INITIAL_MAGNITUDE,
  )
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

  let gearId
  if (state.hand) {
    invariant(state.hand.type === HandType.ApplyForce)
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
            <div className={styles['field-label']}>
              Magnitude
            </div>
            <div>
              <pre className={styles['magnitude-value']}>
                {magnitude}
              </pre>
              <input
                type="range"
                min={MIN_MAGNITUDE}
                max={MAX_MAGNITUDE}
                step={10}
                value={magnitude}
                onChange={(e) => {
                  setMagnitude(parseInt(e.target.value))
                }}
              />
            </div>
            <div className={styles['bottom-buttons']}>
              <button
                disabled={disabled}
                className={styles.button}
                onPointerDown={() => {
                  const { hand } = state
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = true
                  hand.direction = 'ccw'
                  hand.runningEnergyDiff = 0
                }}
                onPointerUp={() => {
                  const { hand } = state
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = false
                  console.log(
                    'energy diff:',
                    hand.runningEnergyDiff,
                  )
                }}
              >
                CCW
              </button>
              <button
                disabled={disabled}
                className={styles.button}
                onPointerDown={() => {
                  const { hand } = state
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = true
                  hand.direction = 'cw'
                  hand.runningEnergyDiff = 0
                }}
                onPointerUp={() => {
                  const { hand } = state
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = false
                  console.log(
                    'energy diff:',
                    hand.runningEnergyDiff,
                  )
                }}
              >
                CW
              </button>
            </div>
          </div>
        </div>
      </Overlay>
    </>
  )
}
