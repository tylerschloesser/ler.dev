import { IAppContext, InitFn, SimpleVec2 } from './types.js'

export const initPointer: InitFn = async (context) => {
  const { canvas, signal } = context
  canvas.container.addEventListener(
    'pointerenter',
    (e) => handlePointer(context, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointermove',
    (e) => handlePointer(context, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointerup',
    (e) => handlePointer(context, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointerdown',
    (e) => handlePointer(context, e),
    { signal },
  )
  canvas.container.addEventListener(
    'pointerleave',
    (e) => handlePointer(context, e),
    { signal },
  )
}

const position: SimpleVec2 = {
  x: 0,
  y: 0,
}

function handlePointer(
  context: IAppContext,
  e: PointerEvent,
): void {
  const { tileSize, camera } = context
  const vx = context.viewport.size.x
  const vy = context.viewport.size.y
  const x =
    (e.offsetX - vx / 2) / tileSize + camera.position.x
  const y =
    (e.offsetY - vy / 2) / tileSize + camera.position.y

  position.x = x
  position.y = y

  for (const listener of context.pointerListeners) {
    listener(context, e, position)
  }
}
