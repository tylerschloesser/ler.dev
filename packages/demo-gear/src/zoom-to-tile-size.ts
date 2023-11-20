import invariant from 'tiny-invariant'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import {
  MAX_TILE_SIZE_FACTOR,
  MIN_TILE_SIZE_FACTOR,
} from './const.js'

const lastArgs = {
  zoom: 0,
  vx: 0,
  vy: 0,
}

let lastTileSize: number = 0

export function zoomToTileSize(
  zoom: number,
  vx: number,
  vy: number,
): number {
  //
  // cache the last tile size because the vast majority of calls
  // to this function will happen when the camera position, but
  // not zoom, changes.
  //
  if (
    lastArgs.zoom === zoom &&
    lastArgs.vx === vx &&
    lastArgs.vy === vy
  ) {
    return lastTileSize
  }

  const minTileSize =
    Math.min(vx, vy) * MIN_TILE_SIZE_FACTOR
  const maxTileSize =
    Math.min(vx, vy) * MAX_TILE_SIZE_FACTOR

  invariant(zoom >= MIN_ZOOM)
  invariant(zoom <= MAX_ZOOM)

  lastArgs.zoom = zoom
  lastArgs.vx = vx
  lastArgs.vy = vy

  return (lastTileSize =
    minTileSize + (maxTileSize - minTileSize) * zoom)
}
