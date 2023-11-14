export type Vec2 = { x: number; y: number }

export type Network = Set<Gear>
export type GearId = string

export const GEAR_SIZES = [1, 3, 5, 7]

export interface Tile {
  gearId: string
}

export enum PointerType {
  Null = 'null',
  AddGear = 'add-gear',
  AddGearWithChain = 'add-gear-with-chain',
  ApplyForce = 'apply-force',
}

export interface NullPointer {
  type: PointerType.Null
  state: null
}

export interface AddGearPointer {
  type: PointerType.AddGear
  size: number
  state: {
    position: Vec2
    valid: boolean
    chain: GearId | null
    connections: Connection[]
  } | null
}

export interface AddGearWithChainPointer {
  type: PointerType.AddGearWithChain
  sourceId: GearId
  state: {
    position: Vec2
    valid: boolean
  } | null
}

export interface ApplyForcePointer {
  type: PointerType.ApplyForce
  acceleration: number
  state: {
    position: Vec2
    active: boolean
    gearId?: string
  } | null
}

export type Pointer =
  | NullPointer
  | AddGearPointer
  | AddGearWithChainPointer
  | ApplyForcePointer

export type InitCanvasFn = (args: {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
}) => void

export type InitPointerFn = (args: {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
}) => void

export type initKeyboardFn = (args: {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
}) => void

export enum ConnectionType {
  Direct = 'direct',
  Chain = 'chain',
}

export interface Connection {
  type: ConnectionType
  gearId: GearId
}

export interface Gear {
  id: GearId
  position: Vec2
  radius: number
  angle: number
  velocity: number
  mass: number
  connections: Connection[]
}
