import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import {
  AddGearPointerStateType,
  InitPointerFn,
  Pointer,
  PointerType,
  World,
} from './types.js'
import { updatePointer } from './update-pointer.js'

type HandlePointerEventFn = (args: {
  e: PointerEvent
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  world: World
}) => void

const handlePointerMove: HandlePointerEventFn = ({
  e,
  canvas,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    canvas,
    pointer: pointer.current,
    world,
  })
}

const handlePointerUp: HandlePointerEventFn = ({
  e,
  canvas,
  pointer,
  world,
}) => {
  updatePointer({
    e,
    canvas,
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
      canvas,
      pointer: pointer.current,
      world,
    })
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
      handlePointerMove({ e, canvas, pointer, world })
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
      handlePointerUp({ e, canvas, pointer, world })
    },
    {
      signal,
    },
  )
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      switch (pointer.current.type) {
        case PointerType.ApplyForce: {
          updatePointer({
            e,
            canvas,
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
