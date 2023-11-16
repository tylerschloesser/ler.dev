import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import { TILE_SIZE } from './const.js'
import {
  AddGearPointerStateType,
  InitPointerFn,
  Pointer,
  PointerType,
  SimpleVec2,
  World,
} from './types.js'
import { updatePointer } from './update-pointer.js'

type HandlePointerEventFn = (args: {
  e: PointerEvent
  position: SimpleVec2
  pointer: React.MutableRefObject<Pointer>
  world: World
}) => void

const handlePointerMove: HandlePointerEventFn = ({
  e,
  position,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    position,
    pointer: pointer.current,
    world,
  })
}

const handlePointerUp: HandlePointerEventFn = ({
  e,
  position,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    position,
    pointer: pointer.current,
    world,
  })
  let needsUpdate = false
  switch (pointer.current.type) {
    case PointerType.AddGear: {
      switch (pointer.current.state?.type) {
        case AddGearPointerStateType.Normal: {
          if (pointer.current.state.valid) {
            addGear({
              position: pointer.current.state.position,
              radius: pointer.current.radius,
              world,
              connections:
                pointer.current.state.connections,
            })
            needsUpdate = true
          }
          break
        }
        case AddGearPointerStateType.Chain: {
          pointer.current = {
            type: PointerType.AddGearWithChain,
            sourceId: pointer.current.state.chain,
            state: null,
          }
          needsUpdate = true
          break
        }
        case AddGearPointerStateType.Attach: {
          addGear({
            position: pointer.current.state.position,
            radius: pointer.current.radius,
            world,
            connections: pointer.current.state.connections,
          })
          needsUpdate = true
          break
        }
      }
      break
    }
    case PointerType.AddGearWithChain: {
      if (pointer.current.state?.valid) {
        const chain = world.gears[pointer.current.sourceId]
        invariant(chain)
        addGear({
          position: pointer.current.state.position,
          radius: 1,
          world,
          connections: pointer.current.state.connections,
        })
        pointer.current = {
          type: PointerType.AddGear,
          radius: 1,
          state: null,
        }
        needsUpdate = true
      }
      break
    }
  }
  if (needsUpdate) {
    updatePointer({
      e,
      position,
      pointer: pointer.current,
      world,
    })
  }
}

function getPointerPosition(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
): SimpleVec2 {
  return {
    x: Math.floor(
      (e.offsetX - canvas.width / 2) / TILE_SIZE,
    ),
    y: Math.floor(
      (e.offsetY - canvas.height / 2) / TILE_SIZE,
    ),
  }
}

export const initPointer: InitPointerFn = ({
  canvas,
  pointer,
  signal,
  world,
}) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const position = getPointerPosition(e, canvas)

      if (
        position.x === pointer.current.state?.position.x &&
        position.y === pointer.current.state.position.y
      ) {
        // optimization. don't do anything until the pointer moves
        // to a new tile
        return
      }

      console.log(`[${position.x},${position.y}]`)

      handlePointerMove({
        e,
        position,
        pointer,
        world,
      })
    },
    {
      signal,
    },
  )
  canvas.addEventListener(
    'pointerleave',
    () => {
      pointer.current.state = null
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerup',
    (e) => {
      const position = getPointerPosition(e, canvas)
      handlePointerUp({
        e,
        position,
        pointer,
        world,
      })
    },
    {
      signal,
    },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      const position = getPointerPosition(e, canvas)
      switch (pointer.current.type) {
        case PointerType.ApplyForce: {
          updatePointer({
            e,
            position,
            pointer: pointer.current,
            world,
          })
          break
        }
      }
    },
    { signal },
  )
}
