import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CameraListenerFn,
  DeleteHand,
  EntityId,
  HandType,
  SimpleVec2,
  TileId,
} from '../types.js'
import {
  deleteEntity,
  incrementBuildVersion,
  iterateTiles,
} from '../util.js'
import { AppContext } from './context.js'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

const MIN_SIZE = 1
const MAX_SIZE = 10

export function Delete() {
  const navigate = useNavigate()
  const [size, setSize] = useSize()
  const position = useHandPosition(size)
  const hand = useHand(position, size)
  const deleteButton = useDeleteButton(hand)

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
            onPointerUp={deleteButton.onPointerUp}
            disabled={deleteButton.disabled}
          >
            Delete
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function useDeleteButton(hand: DeleteHand) {
  const context = use(AppContext)

  const disabled =
    hand.entityIds.size === 0 && hand.tileIds.size === 0

  const onPointerUp = useCallback(() => {
    if (disabled) return

    for (const entityId of hand.entityIds) {
      deleteEntity(context.world, entityId)
    }
    for (const tileId of hand.tileIds) {
      const tile = context.world.tiles[tileId]
      invariant(tile?.resourceType)
      invariant(!tile.entityId)
      delete context.world.tiles[tileId]
    }

    incrementBuildVersion(context)
  }, [disabled, hand, context])

  return { disabled, onPointerUp }
}

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

function useHand(
  position: SimpleVec2,
  size: number,
): DeleteHand {
  const context = use(AppContext)

  const buildVersion = useWorldBuildVersion()

  const hand = useMemo<DeleteHand>(() => {
    const entityIds = new Set<EntityId>()
    const tileIds = new Set<TileId>()

    for (const { tileId, tile } of iterateTiles(
      position.x,
      position.y,
      size,
      size,
      context.world,
    )) {
      if (tile.entityId) {
        entityIds.add(tile.entityId)
      }
      if (tile.resourceType) {
        tileIds.add(tileId)
      }
    }

    return {
      type: HandType.Delete,
      position,
      size,
      entityIds,
      tileIds,
    }
  }, [position, size, buildVersion])

  useEffect(() => {
    context.hand = hand
    return () => {
      context.hand = null
    }
  }, [hand])

  return hand
}

function useSize(): [number, (size: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const size = parseInt(
    searchParams.get('size') ?? `${MIN_SIZE}`,
  )

  invariant(size >= MIN_SIZE)
  invariant(size <= MAX_SIZE)
  invariant(size === Math.abs(size))

  const setSize = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          prev.set('size', `${next}`)
          return prev
        },
        {
          replace: true,
        },
      )
    },
    [setSearchParams],
  )

  return [size, setSize]
}
