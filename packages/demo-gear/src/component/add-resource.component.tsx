import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  AddResourceHand,
  CameraListenerFn,
  HandType,
  ResourceType,
  SimpleVec2,
} from '../types.js'
import { incrementBuildVersion } from '../util.js'
import styles from './add-resource.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

export function AddResource() {
  const navigate = useNavigate()

  const position = useHandPosition()
  const hand = useHand(position)
  const addResourceButton = useAddResourceButton(hand)

  return (
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
        disabled={addResourceButton.disabled}
        className={styles.button}
        onPointerUp={addResourceButton.onPointerUp}
      >
        Add Resource
      </button>
    </Overlay>
  )
}

function useHandPosition(): SimpleVec2 {
  const context = use(AppContext)

  const [position, setPosition] = useState<SimpleVec2>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const listener: CameraListenerFn = () => {
      const x = Math.floor(context.camera.position.x)
      const y = Math.floor(context.camera.position.y)

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
  }, [])

  return position
}

function useHand(position: SimpleVec2): AddResourceHand {
  const context = use(AppContext)
  const buildVersion = useWorldBuildVersion()

  const valid = useMemo(() => {
    const tileId = `${position.x}.${position.y}`
    const tile = context.world.tiles[tileId]
    return !tile?.resourceType
  }, [position, context, buildVersion])

  const hand = useMemo<AddResourceHand>(
    () => ({
      type: HandType.AddResource,
      position,
      valid,
    }),
    [position, valid],
  )

  useEffect(() => {
    context.hand = hand
    return () => {
      context.hand = null
    }
  }, [hand])

  return hand
}

function useAddResourceButton(hand: AddResourceHand) {
  const context = use(AppContext)
  const disabled = !hand.valid

  const onPointerUp = useCallback(() => {
    if (disabled) return

    const tileId = `${hand.position.x}.${hand.position.y}`
    let tile = context.world.tiles[tileId]
    if (!tile) {
      tile = context.world.tiles[tileId] = {}
    }
    invariant(!tile.resourceType)
    tile.resourceType = ResourceType.enum.Fuel

    incrementBuildVersion(context)
  }, [hand, context])

  return { disabled, onPointerUp }
}
