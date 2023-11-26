import { Camera } from './types.js'
import { throttle } from './util.js'

export function useCamera(): {
  camera: Camera
  saveCamera(camera: Camera): void
} {
  return {
    camera: {
      position: { x: 0, y: 0 },
      zoom: 0.5,
    },
    saveCamera: throttle((camera: Camera) => {
      console.log('todo save camera')
    }, 100),
  }
}
