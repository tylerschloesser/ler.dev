import { AppState, InitFn, SimpleVec2 } from './types.js'

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

const position: SimpleVec2 = {
  x: 0,
  y: 0,
}

function handlePointer(
  state: AppState,
  e: PointerEvent,
): void {
  const { canvas, tileSize, camera } = state
  const vx = canvas.width
  const vy = canvas.height
  const x =
    (e.offsetX - vx / 2) / tileSize + camera.position.x
  const y =
    (e.offsetY - vy / 2) / tileSize + camera.position.y

  position.x = x
  position.y = y

  for (const listener of state.pointerListeners) {
    listener(state, e, position)
  }
}
