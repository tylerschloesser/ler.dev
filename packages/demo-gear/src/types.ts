export type Vec2 = { x: number; y: number }

export type GearId = string
export type TileId = string

export interface Tile {
  gearId: GearId
}

export interface World {
  gears: Record<GearId, Gear>
  tiles: Record<TileId, Tile>
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

export enum AddGearPointerStateType {
  Normal = 'normal',
  Chain = 'chain',
  Attach = 'attach',
}

interface BaseAddGearPointerState {
  position: Vec2
  connections: Connection[]
}

export interface NormalAddGearPointerState
  extends BaseAddGearPointerState {
  type: AddGearPointerStateType.Normal
  valid: boolean
}

export interface ChainAddGearPointerState
  extends BaseAddGearPointerState {
  type: AddGearPointerStateType.Chain
  chain: GearId
}

export interface AttachAddGearPointerState
  extends BaseAddGearPointerState {
  type: AddGearPointerStateType.Attach
  attach: GearId
}

export type AddGearPointerState =
  | NormalAddGearPointerState
  | ChainAddGearPointerState
  | AttachAddGearPointerState

export type AddGearPointer = {
  type: PointerType.AddGear
  size: number
  state: AddGearPointerState | null
}

export interface AddGearWithChainPointer {
  type: PointerType.AddGearWithChain
  sourceId: GearId
  state: {
    position: Vec2
    valid: boolean
    connections: Connection[]
  } | null
}

export interface ApplyForcePointer {
  type: PointerType.ApplyForce
  acceleration: number
  state: {
    position: Vec2
    active: boolean
    gearId?: GearId
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
  world: World
}) => void

export type InitPointerFn = (args: {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
  world: World
}) => void

export type initKeyboardFn = (args: {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
}) => void

export type InitSimulatorFn = (args: {
  pointer: React.MutableRefObject<Pointer>
  world: World
  signal: AbortSignal
}) => void

export enum ConnectionType {
  Teeth = 'teeth',
  Chain = 'chain',
  Attached = 'attached',
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
