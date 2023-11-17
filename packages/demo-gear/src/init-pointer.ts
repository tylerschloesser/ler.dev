import { addGear } from './add-gear.js'
import { TILE_SIZE } from './const.js'
import { HoverType, InitFn } from './types.js'
import {
  updateAddGearHover,
  updateApplyForceHover,
} from './update-hover.js'
import { Vec2 } from './vec2.js'

export const initPointer: InitFn = (context) => {
  const { canvas, world, signal } = context
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const position = getPointerPosition(e, canvas)

      if (
        position.x === context.pointer?.position.x &&
        position.y === context.pointer?.position.y
      ) {
        // optimization. don't do anything until the pointer moves
        // to a new tile
        return
      }

      const pointer = (context.pointer = {
        down: e.buttons !== 0,
        position,
      })

      switch (context.hover?.type) {
        case HoverType.AddGear: {
          updateAddGearHover({
            hover: context.hover,
            pointer,
            world,
          })
          break
        }
        case HoverType.ApplyForce: {
          updateApplyForceHover({
            hover: context.hover,
            pointer,
            world,
          })
          break
        }
      }
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    () => {
      context.pointer = null
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => {
      if (!context.pointer) {
        return
      }
      const position = getPointerPosition(e, canvas)
      const pointer = (context.pointer = {
        down: false,
        position,
      })

      switch (context.hover?.type) {
        case HoverType.AddGear: {
          const { radius, connections, valid } =
            context.hover
          if (valid) {
            addGear({
              position,
              radius,
              world,
              connections,
            })
            updateAddGearHover({
              hover: context.hover,
              pointer,
              world,
            })
          }
          break
        }
      }
    },
    {
      signal,
    },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      context.pointer = {
        down: true,
        position: getPointerPosition(e, canvas),
      }
    },
    { signal },
  )
}

function getPointerPosition(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
): Vec2 {
  return new Vec2(
    e.offsetX - canvas.width / 2,
    e.offsetY - canvas.height / 2,
  )
    .div(TILE_SIZE)
    .floor()
}
