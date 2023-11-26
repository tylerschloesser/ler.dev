import { Camera } from './types.js'

export function useCamera(): {
  camera: Camera
} {
  return {
    camera: {
      position: { x: 0, y: 0 },
      zoom: 0.5,
    },
  }
}
