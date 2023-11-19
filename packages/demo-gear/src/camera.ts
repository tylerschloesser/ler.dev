import { TILE_SIZE } from './const.js'
import { AppState, Pointer } from './types.js'

type PointerId = number
const pointerCache = new Map<PointerId, PointerEvent>()

export function handlePointer(
  e: PointerEvent,
  state: AppState,
): void {
  switch (e.type) {
    case 'pointerup': {
      pointerCache.delete(e.pointerId)
      break
    }
    case 'pointerout': {
      pointerCache.delete(e.pointerId)
      break
    }
    case 'pointerleave': {
      pointerCache.delete(e.pointerId)
      break
    }
    case 'pointermove': {
      const prev = pointerCache.get(e.pointerId)
      pointerCache.set(e.pointerId, e)
      if (!e.buttons || !prev?.buttons) {
        return
      }
      switch (pointerCache.size) {
        case 1: {
          handlePointerOne(prev, e, state)
          break
        }
      }
      break
    }
  }
}

function handlePointerOne(
  prev: PointerEvent,
  next: PointerEvent,
  state: AppState,
): void {
  const dx = next.offsetX - prev.offsetX
  const dy = next.offsetY - prev.offsetY

  state.camera.position.x += -dx / TILE_SIZE
  state.camera.position.y += -dy / TILE_SIZE
}
