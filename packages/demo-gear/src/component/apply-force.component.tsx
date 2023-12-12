import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CenterTileIdListener,
  EntityId,
  EntityType,
  HandType,
} from '../types.js'
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
  const [gearId, setGearId] = useState<EntityId | null>(
    null,
  )
  const disabled = gearId === null

  useEffect(() => {
    context.hand = {
      type: HandType.ApplyForce,
      position: null,
      active: false,
      direction: 'cw',
      magnitude,
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
          context.hand?.type === HandType.ApplyForce,
        )
        if (entity?.type === EntityType.enum.Gear) {
          context.hand.gear = entity
          setGearId(entity.id)
        } else {
          context.hand.gear = null
          setGearId(null)
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
                }}
                onPointerUp={() => {
                  const { hand } = context
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = false
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
                }}
                onPointerUp={() => {
                  const { hand } = context
                  invariant(
                    hand?.type === HandType.ApplyForce,
                  )
                  hand.active = false
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
