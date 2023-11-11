import { useRef } from 'react'
import invariant from 'tiny-invariant'
import { GEAR_SIZES, InputState, PointerMode } from './types.js'

const initialState = (() => {
  const gearSize = GEAR_SIZES[0]
  invariant(gearSize !== undefined)
  return { gearSize, pointerMode: PointerMode.AddGear }
})()

export function useInputState() {
  const state = useRef<InputState>(initialState)
  return state
}
