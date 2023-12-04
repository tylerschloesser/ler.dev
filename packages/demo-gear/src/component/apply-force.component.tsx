import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { CenterTileIdListener, HandType } from '../types.js'
import styles from './apply-force.module.scss'
import { AppContext } from './context.js'
import { GearStats } from './gear-stats.component.js'
import { Overlay } from './overlay.component.js'

const INITIAL_MAGNITUDE = 10
const MIN_MAGNITUDE = 0
const MAX_MAGNITUDE = 1000

export function ApplyForce() {
  const navigate = useNavigate()
  const context = use(AppContext)

  const [magnitude, setMagnitude] = useState(
    INITIAL_MAGNITUDE,
  )
  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    context.hand = {
      type: HandType.ApplyForce,
      position: null,
      active: false,
      direction: 'cw',
      magnitude,
      gear: null,
      runningEnergyDiff: 0,
    }

    const centerTileIdListener: CenterTileIdListener =
      () => {
        const tile =
          context.world.tiles[context.centerTileId]
        const gear =
          (tile?.gearId &&
            context.world.gears[tile.gearId]) ||
          null
        invariant(
          context.hand?.type === HandType.ApplyForce,
        )
        if (context.hand.gear !== gear) {
          context.hand.gear = gear
          setDisabled(gear === null)
        }
      }
    context.centerTileIdListeners.add(centerTileIdListener)
    centerTileIdListener(context)

    return () => {
      context.hand = null
      context.centerTileIdListeners.delete(
        centerTileIdListener,
      )
    }
  }, [context])

  useEffect(() => {
    invariant(context.hand?.type === HandType.ApplyForce)
    context.hand.magnitude = magnitude
  }, [context, magnitude])

  let gearId
  if (context.hand) {
    invariant(context.hand.type === HandType.ApplyForce)
    gearId = context.hand.gear?.id ?? null
  }

  return (
    <>
      {gearId && (
        <Overlay position="top">
          <GearStats context={context} gearId={gearId} />
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
                  const { hand } = context
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = true
                  hand.direction = 'ccw'
                  hand.runningEnergyDiff = 0
                }}
                onPointerUp={() => {
                  const { hand } = context
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
                  const { hand } = context
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = true
                  hand.direction = 'cw'
                  hand.runningEnergyDiff = 0
                }}
                onPointerUp={() => {
                  const { hand } = context
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
