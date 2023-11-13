export type Vec2 = { x: number; y: number }

export type Network = Set<Gear>
export type GearId = string

export const GEAR_SIZES = [1, 3, 5, 7]

export enum PointerMode {
  AddGear = 'add-gear',
  ApplyForce = 'apply-force',
}

export interface InputState {
  pointerMode: PointerMode
  gearSize: number
  acceleration: number
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

export interface Gear {
  id: string
  position: Vec2
  radius: number
  angle: number
  velocity: number
  mass: number
  connections: Set<string>
}
