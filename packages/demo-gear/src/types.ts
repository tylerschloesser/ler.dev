export type Vec2 = { x: number; y: number }

export const GEAR_SIZES = [1, 3, 5, 7]

export interface InputState {
  gearSize: number
}

export type InitCanvasFn = (args: {
  canvas: HTMLCanvasElement
  inputState: React.MutableRefObject<InputState>
}) => void
export type InitPointerFn = (args: {
  canvas: HTMLCanvasElement
  inputState: React.MutableRefObject<InputState>
}) => void
export type initKeyboardFn = (args: { canvas: HTMLCanvasElement }) => void
