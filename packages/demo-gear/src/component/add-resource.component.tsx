import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  CameraListenerFn,
  CenterTileIdListener,
  HandType,
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
      state.hand.position.y = x

      const tile = state.world.tiles[tileId]
      setValid((state.hand.valid = !tile?.resourceType))
    }
    state.cameraListeners.add(cameraListener)
    cameraListener(state)
    return () => {
      state.cameraListeners.delete(cameraListener)
    }
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
      <button disabled={!valid} className={styles.button}>
        Add Resource
      </button>
    </Overlay>
  )
}
