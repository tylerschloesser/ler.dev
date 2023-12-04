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
  const state = use(AppContext)
  const navigate = useNavigate()
  const [valid, setValid] = useState<boolean>(false)

  useEffect(() => {
    if (!state) {
      return
    }
    state.hand = {
      type: HandType.AddResource,
      position: { x: 0, y: 0 },
      valid,
    }

    const cameraListener: CameraListenerFn = () => {
      const x = Math.floor(state.camera.position.x)
      const y = Math.floor(state.camera.position.y)
      const tileId = `${x}.${y}`
      invariant(state.hand?.type === HandType.AddResource)
      state.hand.position.x = x
      state.hand.position.y = y

      const tile = state.world.tiles[tileId]
      console.log(tile, tileId)
      setValid((state.hand.valid = !tile?.resourceType))
    }
    state.cameraListeners.add(cameraListener)
    cameraListener(state)
    return () => {
      state.hand = null
      state.cameraListeners.delete(cameraListener)
    }
  }, [state])

  const addResource = useCallback(() => {
    if (!state) return
    invariant(state.hand?.type === HandType.AddResource)
    if (!state.hand.valid) return
    const { x, y } = state.hand.position
    const tileId = `${x}.${y}`
    let tile = state.world.tiles[tileId]
    invariant(!tile?.resourceType)
    if (!tile) {
      console.log(`set tile id: ${tileId}`)
      tile = state.world.tiles[tileId] = {}
    }
    tile.resourceType = ResourceType.enum.Fuel
    setValid((state.hand.valid = false))
  }, [state])

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
