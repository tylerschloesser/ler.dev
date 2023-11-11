import { useRef } from 'react'
import invariant from 'tiny-invariant'
import { GEAR_SIZES, InputState, PointerMode } from './types.js'

function load(): InputState | null {
  const json = localStorage.getItem('inputState')
  return json ? JSON.parse(json) : null
}

function save(inputState: InputState): void {
  localStorage.setItem('inputState', JSON.stringify(inputState))
}

const initialState = (() => {
  const saved = load()
  if (saved) {
    return saved
  }
  const gearSize = GEAR_SIZES[0]
  invariant(gearSize !== undefined)
  return { gearSize, pointerMode: PointerMode.AddGear, acceleration: 1 }
})()

export function useInputState(): {
  inputState: React.MutableRefObject<InputState>
  saveInputState(): void
} {
  const inputState = useRef<InputState>(initialState)
  return {
    inputState,
    saveInputState() {
      save(inputState.current)
    },
  }
}
