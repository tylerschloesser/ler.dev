import invariant from 'tiny-invariant'
import {
  MAX_TILE_SIZE_FACTOR,
  MAX_ZOOM,
  MIN_TILE_SIZE_FACTOR,
  MIN_ZOOM,
} from './const.js'
import { AppState } from './types.js'
import {
  clamp,
  clampTileSize,
  clampZoom,
  dist,
} from './util.js'

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
          handlePointerOne(state, prev, e)
          break
        }
        case 2: {
          handlePointerTwo(state, prev, e)
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

  // new center in pixel/screen coordinates
  const sx = e.offsetX - vx / 2
  const sy = e.offsetY - vy / 2

  const prevTileSize = zoomToTileSize(prevZoom, vx, vy)
  const nextTileSize = zoomToTileSize(nextZoom, vx, vy)

  camera.position.x += sx / prevTileSize - sx / nextTileSize
  camera.position.y += sy / prevTileSize - sy / nextTileSize
  camera.zoom = nextZoom

  state.tileSize = nextTileSize
}

function handlePointerOne(
  state: AppState,
  prev: PointerEvent,
  next: PointerEvent,
): void {
  const { camera, tileSize } = state
  const dx = next.offsetX - prev.offsetX
  const dy = next.offsetY - prev.offsetY

  camera.position.x += -dx / tileSize
  camera.position.y += -dy / tileSize
}

function handlePointerTwo(
  state: AppState,
  prev: PointerEvent,
  next: PointerEvent,
): void {
  const { camera } = state
  const other = getOtherPointer(next)
  if (!other.buttons) {
    return
  }

  const ox = other.offsetX
  const oy = other.offsetY
  const px = prev.offsetX
  const py = prev.offsetY
  const nx = next.offsetX
  const ny = next.offsetY

  // center of the line between both pointers
  const pcx = ox + (px - ox) / 2
  const pcy = oy + (py - oy) / 2
  const ncx = ox + (nx - ox) / 2
  const ncy = oy + (ny - oy) / 2

  // distance between both pointers
  const pd = dist(px, py, ox, oy)
  const nd = dist(nx, ny, ox, oy)

  const vx = state.canvas.width
  const vy = state.canvas.height

  const pts = state.tileSize
  const nts = clampTileSize(pts * (nd / pd), vx, vy)

  // how far did the center move, aka how much to move
  // the camera in addition to the change in tile size
  const mx = (ncx - pcx) / -nts
  const my = (ncy - pcy) / -nts

  // new center in pixel/screen coordinates
  const sx = ncx - vx / 2
  const sy = ncy - vy / 2

  // final camera movement
  const dx = sx / pts - sx / nts + mx
  const dy = sy / pts - sy / nts + my

  camera.position.x += dx
  camera.position.y += dy
  camera.zoom = tileSizeToZoom(nts, vx, vy)
  state.tileSize = nts
}

function getOtherPointer(e: PointerEvent) {
  invariant(pointerCache.size === 2)
  for (const other of pointerCache.values()) {
    if (other.pointerId !== e.pointerId) {
      return other
    }
  }
  invariant(false)
}

export function zoomToTileSize(
  zoom: number,
  vx: number,
  vy: number,
): number {
  const minTileSize =
    Math.min(vx, vy) * MIN_TILE_SIZE_FACTOR
  const maxTileSize =
    Math.min(vx, vy) * MAX_TILE_SIZE_FACTOR
  invariant(zoom >= MIN_ZOOM)
  invariant(zoom <= MAX_ZOOM)
  return minTileSize + (maxTileSize - minTileSize) * zoom
}

export function tileSizeToZoom(
  tileSize: number,
  vx: number,
  vy: number,
): number {
  const minTileSize =
    Math.min(vx, vy) * MIN_TILE_SIZE_FACTOR
  const maxTileSize =
    Math.min(vx, vy) * MAX_TILE_SIZE_FACTOR
  const zoom =
    (tileSize - minTileSize) / (maxTileSize - minTileSize)
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}
