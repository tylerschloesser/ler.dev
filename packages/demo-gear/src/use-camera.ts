import { Camera } from './types.js'
import { throttle } from './util.js'

const DEFAULT_CAMERA: Camera = {
  position: { x: 0, y: 0 },
  zoom: 0.5,
}

function loadCamera(): Camera {
  const json = localStorage.getItem('camera')
  if (json) {
    return Camera.parse(JSON.parse(json))
  }
  return DEFAULT_CAMERA
}

function saveCamera(camera: Camera): void {
  localStorage.setItem('camera', JSON.stringify(camera))
}

export function useCamera(): {
  camera: Camera
  saveCamera(camera: Camera): void
} {
  return {
    camera: loadCamera(),
    saveCamera: throttle(saveCamera, 100),
  }
}
