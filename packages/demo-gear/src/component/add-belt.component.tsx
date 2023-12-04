import { use, useEffect } from 'react'
import invariant from 'tiny-invariant'
import { HandType } from '../types.js'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'

export function AddBelt() {
  const state = use(AppContext)

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

  return <Overlay>TODO</Overlay>
}
