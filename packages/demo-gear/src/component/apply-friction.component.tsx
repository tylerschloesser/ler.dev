import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { CenterTileIdListener, HandType } from '../types.js'
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
  const context = use(AppContext)

  const [coeffecient, setCoeffecient] = useState(5)
  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (!context) {
      return
    }

    context.hand = {
      type: HandType.ApplyFriction,
      position: null,
      active: false,
      coeffecient: coeffecient * COEFFECIENT_SCALE,
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
          context.hand?.type === HandType.ApplyFriction,
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
    if (!context) {
      return
    }
    invariant(context.hand?.type === HandType.ApplyFriction)
    context.hand.coeffecient =
      coeffecient * COEFFECIENT_SCALE
  }, [context, coeffecient])

  if (!context) {
    return
  }

  let gearId
  if (context.hand) {
    invariant(context.hand.type === HandType.ApplyFriction)
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
            const { hand } = context
            invariant(hand?.type === HandType.ApplyFriction)
            hand.runningEnergyDiff = 0
            hand.active = true
          }}
          onPointerUp={() => {
            const { hand } = context
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
