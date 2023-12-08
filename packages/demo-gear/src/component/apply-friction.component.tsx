import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CenterTileIdListener,
  EntityType,
  HandType,
} from '../types.js'
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
    context.hand = {
      type: HandType.ApplyFriction,
      position: null,
      active: false,
      coeffecient: coeffecient * COEFFECIENT_SCALE,
      gear: null,
    }

    const centerTileIdListener: CenterTileIdListener =
      () => {
        const tile =
          context.world.tiles[context.centerTileId]
        const entity =
          (tile?.entityId &&
            context.world.entities[tile.entityId]) ||
          null
        invariant(
          context.hand?.type === HandType.ApplyFriction,
        )
        if (entity?.type === EntityType.enum.Gear) {
          context.hand.gear = entity
          setDisabled(false)
        } else {
          setDisabled(true)
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
    invariant(context.hand?.type === HandType.ApplyFriction)
    context.hand.coeffecient =
      coeffecient * COEFFECIENT_SCALE
  }, [context, coeffecient])

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
            hand.active = true
          }}
          onPointerUp={() => {
            const { hand } = context
            invariant(hand?.type === HandType.ApplyFriction)
            hand.active = false
          }}
        >
          Apply
        </button>
      </Overlay>
    </>
  )
}
