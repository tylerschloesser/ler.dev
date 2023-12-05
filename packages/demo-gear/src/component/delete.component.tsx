import { use, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CameraListenerFn,
  DeleteHand,
  HandType,
  IAppContext,
  SimpleVec2,
} from '../types.js'
import {
  iterateGearTileIds,
  iterateGearTiles,
  iterateTiles,
} from '../util.js'
import { AppContext } from './context.js'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'

const MIN_SIZE = 1
const MAX_SIZE = 10

function useHandPosition(size: number): SimpleVec2 {
  const context = use(AppContext)
  const [position, setPosition] = useState<SimpleVec2>({
    x: 0,
    y: 0,
  })
  useEffect(() => {
    const listener: CameraListenerFn = () => {
      const x = Math.round(
        context.camera.position.x - size / 2,
      )
      const y = Math.round(
        context.camera.position.y - size / 2,
      )
      setPosition((prev) => {
        if (prev.x === x && prev.y === y) {
          return prev
        }
        return { x, y }
      })
    }
    context.cameraListeners.add(listener)
    listener(context)
    return () => {
      context.cameraListeners.delete(listener)
    }
  }, [size])
  return position
}

function checkDelete(
  context: IAppContext,
  hand: DeleteHand,
  setDisabled: (disabled: boolean) => void,
): void {
  const { position, size, gearIds, tileIds } = hand
  gearIds.clear()
  tileIds.clear()

  for (const { tileId, tile } of iterateTiles(
    position.x,
    position.y,
    size,
    size,
    context.world,
  )) {
    if (tile.gearId) {
      gearIds.add(tile.gearId)
    } else if (tile.beltId || tile.resourceType) {
      tileIds.add(tileId)
    }
  }

  setDisabled(gearIds.size === 0 && tileIds.size === 0)
}

export function Delete() {
  const navigate = useNavigate()
  const [size, setSize] = useState(MIN_SIZE)
  const [disabled, setDisabled] = useState(true)

  invariant(size >= MIN_SIZE)
  invariant(size <= MAX_SIZE)
  invariant(size === Math.abs(size))

  const position = useHandPosition(size)

  const hand = useRef<DeleteHand>({
    type: HandType.Delete,
    position,
    size,
    gearIds: new Set(),
    tileIds: new Set(),
  })

  const context = use(AppContext)
  useEffect(() => {
    context.hand = hand.current
    return () => {
      context.hand = null
    }
  }, [])

  useEffect(() => {
    hand.current.size = size
    hand.current.position = position
    checkDelete(context, hand.current, setDisabled)
  }, [size, position])

  return (
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
          <div className={styles['field-label']}>Size</div>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={1}
            value={size}
            onChange={(e) => {
              setSize(parseInt(e.target.value))
            }}
          />
          <button
            className={styles.button}
            onPointerUp={() => {
              if (disabled) return

              for (const gearId of hand.current.gearIds) {
                const gear = context.world.gears[gearId]
                invariant(gear)

                for (const tileId of iterateGearTileIds(
                  gear.position,
                  gear.radius,
                )) {
                  const tile = context.world.tiles[tileId]
                  invariant(tile)

                  if (tile.attachedGearId === gearId) {
                    delete tile.attachedGearId
                  } else {
                    invariant(tile.gearId === gearId)
                    if (tile.attachedGearId) {
                      tile.gearId = tile.attachedGearId
                    } else {
                      delete tile.gearId
                    }
                  }

                  if (!tile.gearId && !tile.resourceType) {
                    delete context.world.tiles[tileId]
                  }
                }

                for (const connection of gear.connections) {
                  const neighbor =
                    context.world.gears[connection.gearId]
                  invariant(neighbor)
                  const index =
                    neighbor.connections.findIndex(
                      ({ gearId }) => gearId === gear.id,
                    )
                  invariant(index !== -1)
                  neighbor.connections.splice(index, 1)
                }

                delete context.world.gears[gearId]
              }

              checkDelete(
                context,
                hand.current,
                setDisabled,
              )
            }}
            disabled={disabled}
          >
            Delete
          </button>
        </div>
      </div>
    </Overlay>
  )
}
