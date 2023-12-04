import { use, useEffect, useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import * as z from 'zod'
import {
  CameraListenerFn,
  HandType,
  SimpleVec2,
} from '../types.js'
import styles from './add-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

enum ViewType {
  Start = 'start',
  End = 'end',
}

const UrlState = z.strictObject({
  start: SimpleVec2.optional(),
  end: SimpleVec2.optional(),
})
type UrlState = z.infer<typeof UrlState>

export function AddBelt() {
  const state = use(AppContext)
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

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
      valid: false,
    }

    const cameraListener: CameraListenerFn = () => {
      invariant(state.hand?.type === HandType.AddBelt)
      if (state.hand.start === null) {
        const x = Math.floor(state.camera.position.x)
        const y = Math.floor(state.camera.position.y)
        const tileId = `${x}.${y}`
        const tile = state.world.tiles[tileId]
        setValid(
          (state.hand.valid = !(
            tile?.beltId || tile?.gearId
          )),
        )
      }
    }
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
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!state) return
            invariant(state.hand?.type === HandType.AddBelt)
            invariant(state.hand.start === null)
            invariant(state.hand.end === null)

            state.hand.start = {
              x: Math.floor(state.camera.position.x),
              y: Math.floor(state.camera.position.y),
            }

            setViewType(ViewType.End)
          }}
        >
          Start
        </button>
      )}
    </Overlay>
  )
}
