import invariant from 'tiny-invariant'
import {
  MAX_TILE_SIZE_FACTOR,
  MAX_ZOOM,
  MIN_TILE_SIZE_FACTOR,
  MIN_ZOOM,
} from './const.js'
import { IAppContext, PointerListenerFn } from './types.js'
import {
  clamp,
  clampTileSize,
  clampZoom,
  dist,
} from './util.js'

type PointerId = number
const pointerCache = new Map<PointerId, PointerEvent>()

export const moveCamera: PointerListenerFn = (
  context: IAppContext,
  e: PointerEvent,
) => {
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
          handlePointerOne(context, prev, e)
          break
        }
        case 2: {
          handlePointerTwo(context, prev, e)
          break
        }
      }
      break
    }
  }
}

export function handleWheel(
  context: IAppContext,
  e: WheelEvent,
): void {
  const { camera } = context
  const pz = camera.zoom
  const vx = context.viewport.size.x
  const vy = context.viewport.size.y
  const scale = vy * (1 + (1 - context.camera.zoom))
  const nz = clampZoom(camera.zoom + -e.deltaY / scale)

  if (pz === nz) {
    return
  }

  // the point, relative to the center of the screen,
  // at which the change in position due to change
  // in tile size
  const rx = e.offsetX - vx / 2
  const ry = e.offsetY - vy / 2

  const pts = context.tileSize
  const nts = zoomToTileSize(nz, vx, vy)

  updateCamera(
    context,
    camera.position.x + rx / pts - rx / nts,
    camera.position.y + ry / pts - ry / nts,
    nz,
    nts,
  )
}

function handlePointerOne(
  context: IAppContext,
  prev: PointerEvent,
  next: PointerEvent,
): void {
  const { camera, tileSize } = context
  const dx = next.offsetX - prev.offsetX
  const dy = next.offsetY - prev.offsetY

  updateCamera(
    context,
    camera.position.x + -dx / tileSize,
    camera.position.y + -dy / tileSize,
    camera.zoom,
    context.tileSize,
  )
}

function handlePointerTwo(
  context: IAppContext,
  prev: PointerEvent,
  next: PointerEvent,
): void {
  const { camera } = context
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

  const vx = context.viewport.size.x
  const vy = context.viewport.size.y

  const pts = context.tileSize
  const nts = clampTileSize(pts * (nd / pd), vx, vy)

  // how far did the center move, aka how much to move
  // the camera in addition to the change in tile size
  const dcx = ncx - pcx
  const dcy = ncy - pcy

  // the point, relative to the center of the screen,
  // at which the change in position due to change
  // in tile size
  const rx = ncx - vx / 2
  const ry = ncy - vy / 2

  // final camera movement
  const dx = rx / pts - (rx + dcx) / nts
  const dy = ry / pts - (ry + dcy) / nts

  updateCamera(
    context,
    camera.position.x + dx,
    camera.position.y + dy,
    tileSizeToZoom(nts, vx, vy),
    nts,
  )
}

function updateCamera(
  context: IAppContext,
  x: number,
  y: number,
  zoom: number,
  tileSize: number,
): void {
  context.camera.position.x = x
  context.camera.position.y = y
  context.camera.zoom = zoom
  context.tileSize = tileSize

  context.cameraListeners.forEach((listener) => {
    listener(context)
  })
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
