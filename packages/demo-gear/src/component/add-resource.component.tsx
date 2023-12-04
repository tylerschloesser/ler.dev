import { use, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CenterTileIdListener } from '../types.js'
import styles from './add-resource.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddResource() {
  const state = use(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!state) {
      return
    }
    const centerTileIdListener: CenterTileIdListener =
      () => {
        const tile = state.world.tiles[state.centerTileId]
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
      <button className={styles.button}>
        Add Resource
      </button>
    </Overlay>
  )
}
