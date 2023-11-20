import { TILE_SIZE } from './const.js'
import { AppState } from './types.js'
import { clampZoom } from './util.js'
import { zoomToTileSize } from './zoom-to-tile-size.js'

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

export function handleWheel(
  e: WheelEvent,
  state: AppState,
): void {
  const { camera } = state
  const prevZoom = camera.zoom

  const vx = state.canvas.width
  const vy = state.canvas.height
  const scale = vy * (1 + (1 - state.camera.zoom))

  const nextZoom = clampZoom(
    camera.zoom + -e.deltaY / scale,
  )

  if (prevZoom === nextZoom) {
    return
  }

  // screen x/y
  const sx = e.clientX - vx / 2
  const sy = e.clientY - vy / 2

  const prevTileSize = zoomToTileSize(prevZoom, vx, vy)
  const nextTileSize = zoomToTileSize(nextZoom, vx, vy)

  camera.position.x = sx / prevTileSize - sx / nextTileSize
  camera.position.y = sy / prevTileSize - sy / nextTileSize
  camera.zoom = nextZoom

  state.tileSize = nextTileSize
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
