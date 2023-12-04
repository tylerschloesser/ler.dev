import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { CameraListenerFn, HandType } from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

enum ViewType {
  Start = 'start',
  End = 'end',
}

export function AddBelt() {
  const state = use(AppContext)
  const navigate = useNavigate()
  const [viewType, setViewType] = useState<ViewType>(
    ViewType.Start,
  )
  const [valid, setValid] = useState<boolean>(false)

  useEffect(() => {
    if (!state) return
    invariant(state.hand === null)

    state.hand = {
      type: HandType.AddBelt,
      start: null,
      end: null,
      position: { x: 0, y: 0 },
      valid: false,
    }

    const cameraListener: CameraListenerFn = () => {}
    state.cameraListeners.add(cameraListener)
    cameraListener(state)

    return () => {
      state.hand = null
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
      {viewType === ViewType.Start && (
        <button disabled={!valid} className={styles.button}>
          Start
        </button>
      )}
    </Overlay>
  )
}
