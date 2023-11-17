import * as z from 'zod'
import { Vec2 } from './vec2.js'

export const SimpleVec2 = z.strictObject({
  x: z.number(),
  y: z.number(),
})
export type SimpleVec2 = z.infer<typeof SimpleVec2>

export const GearId = z.string()
export type GearId = z.infer<typeof GearId>

export const TileId = z.string()
export type TileId = z.infer<typeof TileId>

export const Tile = z.strictObject({
  gearIds: z.array(GearId),
})
export type Tile = z.infer<typeof Tile>

export const ConnectionType = z.enum([
  'Teeth',
  'Chain',
  'Attached',
])
export type ConnectionType = z.infer<typeof ConnectionType>

export const Connection = z.strictObject({
  type: ConnectionType,
  gearId: GearId,
})
export type Connection = z.infer<typeof Connection>

export const Gear = z.strictObject({
  id: GearId,
  position: SimpleVec2,
  radius: z.number(),
  angle: z.number(),
  velocity: z.number(),
  mass: z.number(),
  connections: z.array(Connection),
})
export type Gear = z.infer<typeof Gear>

export const World = z.strictObject({
  gears: z.record(GearId, Gear),
  tiles: z.record(TileId, Tile),

  debugConnections: z.boolean(),
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
  position: SimpleVec2
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
    position: SimpleVec2
    valid: boolean
    connections: Connection[]
  } | null
}

export interface ApplyForcePointer {
  type: PointerType.ApplyForce
  acceleration: number
  state: {
    position: SimpleVec2
    active: boolean
    gearId?: GearId
  } | null
}

export type Pointer =
  | NullPointer
  | AddGearPointer
  | AddGearWithChainPointer
  | ApplyForcePointer

export interface PointerState {
  position: Vec2
  down: boolean
}

export enum HoverStateType {
  Null,
  AddGear,
  ApplyForce,
}

export interface NullHoverState {
  type: HoverStateType.Null
}

export interface AddGearHoverState {
  type: HoverStateType.AddGear
  valid: boolean
  radius: number
  connections: Connection[]
}

export interface ApplyForceHoverState {
  type: HoverStateType.ApplyForce
  acceleration: number
}

export type HoverState =
  | NullHoverState
  | AddGearHoverState
  | ApplyForceHoverState

export interface InitArgs {
  canvas: HTMLCanvasElement
  pointer: React.MutableRefObject<Pointer>
  signal: AbortSignal
  world: World
}

export type InitFn = (args: InitArgs) => void

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle'
>
