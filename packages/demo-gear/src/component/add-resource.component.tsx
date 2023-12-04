import {
  use,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CameraListenerFn,
  HandType,
  ResourceType,
} from '../types.js'
import styles from './add-resource.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddResource() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [valid, setValid] = useState<boolean>(false)

  useEffect(() => {
    context.hand = {
      type: HandType.AddResource,
      position: { x: 0, y: 0 },
      valid,
    }

    const cameraListener: CameraListenerFn = () => {
      const x = Math.floor(context.camera.position.x)
      const y = Math.floor(context.camera.position.y)
      const tileId = `${x}.${y}`
      invariant(context.hand?.type === HandType.AddResource)
      context.hand.position.x = x
      context.hand.position.y = y

      const tile = context.world.tiles[tileId]
      console.log(tile, tileId)
      setValid((context.hand.valid = !tile?.resourceType))
    }
    context.cameraListeners.add(cameraListener)
    cameraListener(context)
    return () => {
      context.hand = null
      context.cameraListeners.delete(cameraListener)
    }
  }, [context])

  const addResource = useCallback(() => {
    invariant(context.hand?.type === HandType.AddResource)
    if (!context.hand.valid) return
    const { x, y } = context.hand.position
    const tileId = `${x}.${y}`
    let tile = context.world.tiles[tileId]
    invariant(!tile?.resourceType)
    if (!tile) {
      console.log(`set tile id: ${tileId}`)
      tile = context.world.tiles[tileId] = {}
    }
    tile.resourceType = ResourceType.enum.Fuel
    setValid((context.hand.valid = false))
  }, [context])

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
        disabled={!valid}
        className={styles.button}
        onPointerUp={addResource}
      >
        Add Resource
      </button>
    </Overlay>
  )
}
