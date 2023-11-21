import { AppState, InitFn, SimpleVec2 } from './types.js'

export const initPointer: InitFn = async (state) => {
  const { canvas, signal } = state
  canvas.container.addEventListener(
    'pointerenter',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointermove',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointerup',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointerdown',
    (e) => handlePointer(state, e),
    { signal },
  )
  canvas.container.addEventListener(
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
  const { tileSize, camera } = state
  const vx = state.viewport.size.x
  const vy = state.viewport.size.y
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
