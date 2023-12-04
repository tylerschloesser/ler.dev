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
  const context = use(AppContext)
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const [viewType, setViewType] = useState<ViewType>(
    ViewType.Start,
  )
  const [valid, setValid] = useState<boolean>(false)

  useEffect(() => {
    if (!context) return
    invariant(context.hand === null)

    context.hand = {
      type: HandType.AddBelt,
      start: null,
      end: null,
      valid: false,
    }

    const cameraListener: CameraListenerFn = () => {
      invariant(context.hand?.type === HandType.AddBelt)
      if (context.hand.start === null) {
        const x = Math.floor(context.camera.position.x)
        const y = Math.floor(context.camera.position.y)
        const tileId = `${x}.${y}`
        const tile = context.world.tiles[tileId]
        setValid(
          (context.hand.valid = !(
            tile?.beltId || tile?.gearId
          )),
        )
      }
    }
    context.cameraListeners.add(cameraListener)
    cameraListener(context)

    return () => {
      context.hand = null
      context.cameraListeners.delete(cameraListener)
    }
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
      {viewType === ViewType.Start && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!context) return
            invariant(
              context.hand?.type === HandType.AddBelt,
            )
            invariant(context.hand.start === null)
            invariant(context.hand.end === null)

            context.hand.start = {
              x: Math.floor(context.camera.position.x),
              y: Math.floor(context.camera.position.y),
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
