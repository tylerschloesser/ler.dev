import {
  applyForcePointerDown,
  applyForcePointerMove,
  applyForcePointerUp,
} from './apply-force-pointer.js'
import {
  buildPointerDown,
  buildPointerMove,
  buildPointerUp,
} from './build-pointer.js'
import { TILE_SIZE } from './const.js'
import { InitFn, Pointer, PointerType } from './types.js'

export const initPointer: InitFn = (state) => {
  const { canvas, signal } = state

  canvas.addEventListener(
    'pointermove',
    (e) => {
      if (!state.pointer) {
        return
      }
      if (!updatePosition(e, canvas, state.pointer)) {
        return
      }
      switch (state.pointer.type) {
        case PointerType.Build:
          buildPointerMove(state, state.pointer)
          break
        case PointerType.ApplyForce:
          applyForcePointerMove(state, state.pointer)
          break
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    () => {
      if (state.pointer) {
        state.pointer.position = null
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => {
      if (!state.pointer) {
        return
      }
      updatePosition(e, canvas, state.pointer)
      switch (state.pointer.type) {
        case PointerType.Build:
          buildPointerUp(state, state.pointer)
          break
        case PointerType.ApplyForce:
          applyForcePointerUp(state, state.pointer)
          break
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!state.pointer) {
        return
      }
      updatePosition(e, canvas, state.pointer)
      switch (state.pointer.type) {
        case PointerType.Build:
          buildPointerDown(state, state.pointer)
          break
        case PointerType.ApplyForce:
          applyForcePointerDown(state, state.pointer)
          break
      }
    },
    { signal },
  )
}

function updatePosition(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
  pointer: Pointer,
): boolean {
  const x = Math.floor(
    (e.offsetX - canvas.width / 2) / TILE_SIZE + 0.5,
  )
  const y = Math.floor(
    (e.offsetY - canvas.height / 2) / TILE_SIZE + 0.5,
  )

  if (!pointer.position) {
    pointer.position = { x, y }
    return true
  }

  if (
    pointer.position.x === x &&
    pointer.position.y === y
  ) {
    return false
  }

  pointer.position.x = x
  pointer.position.y = y
  return true
}
