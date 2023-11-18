import { AppState } from './types.js'

type PointerId = number
const pointerCache = new Map<PointerId, PointerEvent>()

export function handlePointer(
  e: PointerEvent,
  state: AppState,
): void {}
