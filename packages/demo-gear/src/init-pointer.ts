import { AppState, InitFn } from './types.js'

export const initPointer: InitFn = (state) => {
  const { canvas, signal } = state
  canvas.addEventListener(
    'pointerenter',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.addEventListener(
    'pointermove',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    (e) => handlePointer(state, e),
    { signal },
  )
}

function handlePointer(
  state: AppState,
  e: PointerEvent,
): void {
  for (const listener of state.pointerListeners) {
    listener(state, e)
  }
}
