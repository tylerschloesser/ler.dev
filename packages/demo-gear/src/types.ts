import * as z from 'zod'

export const Vec2 = z.object({
  x: z.number(),
  y: z.number(),
})
export type Vec2 = z.infer<typeof Vec2>

export const GearId = z.string()
export type GearId = z.infer<typeof GearId>

export const TileId = z.string()
export type TileId = z.infer<typeof TileId>

export const Tile = z.object({
  gearIds: z.array(GearId),
})
export type Tile = z.infer<typeof Tile>

export const ConnectionType = z.enum([
  'Teeth',
  'Chain',
  'Attached',
])
export type ConnectionType = z.infer<typeof ConnectionType>

export const Connection = z.object({
  type: ConnectionType,
  gearId: GearId,
})
export type Connection = z.infer<typeof Connection>

export const Gear = z.object({
  id: GearId,
  position: Vec2,
  radius: z.number(),
  angle: z.number(),
  velocity: z.number(),
  mass: z.number(),
  connections: z.array(Connection),
})
export type Gear = z.infer<typeof Gear>

export const World = z.object({
  gears: z.record(GearId, Gear),
  tiles: z.record(TileId, Tile),
  debugConnections: z.boolean().optional(),
})
export type World = z.infer<typeof World>

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
  radius: number
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
