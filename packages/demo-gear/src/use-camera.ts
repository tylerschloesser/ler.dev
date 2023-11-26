import { Camera } from './types.js'

export function useCamera(): Camera {
  return {
    position: { x: 0, y: 0 },
    zoom: 0.5,
  }
}
