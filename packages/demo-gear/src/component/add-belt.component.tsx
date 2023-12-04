import { use, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { HandType } from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddBelt() {
  const state = use(AppContext)
  const navigate = useNavigate()

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

    return () => {
      state.hand = null
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
    </Overlay>
  )
}
