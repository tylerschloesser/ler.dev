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
  gearId: GearId,
  attachedGearId: GearId.optional(),
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

export interface Pointer {
  position: Vec2
  down: boolean
}

export enum HoverType {
  Null = 'null',
  AddGear = 'add-gear',

  ApplyForce = 'apply-force',
}

export enum AddGearStateType {
  Normal = 'normal',
  Attach = 'attach',
  StartChain = 'start-chain',
  EndChain = 'end-chain',
}

export interface NormalAddGearState {
  type: AddGearStateType.Normal
  connections: Connection[]
}

export interface AttachAddGearState {
  type: AddGearStateType.Attach
  sourceId: GearId
}

export interface StartChainAddGearType {
  type: AddGearStateType.StartChain
  sourceId: GearId
}

export interface EndChainAddGearType {
  type: AddGearStateType.EndChain
  sourceId: GearId
  connections: Connection[]
}

export type AddGearState =
  | NormalAddGearState
  | AttachAddGearState
  | StartChainAddGearType
  | EndChainAddGearType

export interface NullHover {
  type: HoverType.Null
}

export enum InvalidReasonType {
  Overlaps = 'overlaps',
}

export interface OverlapsInvalidReason {
  type: InvalidReasonType.Overlaps
  gearId: GearId
}

export type InvalidReason = OverlapsInvalidReason

export interface AddGearHover {
  type: HoverType.AddGear
  radius: number
  connections: Connection[]
  valid: boolean
  reasons: InvalidReason[]
}

export interface ApplyForceHover {
  type: HoverType.ApplyForce
  acceleration: number
}

export type Hover =
  | NullHover
  | AddGearHover
  | ApplyForceHover

export type SetWorldFn = (world: World) => void

export interface AppState {
  pointer: Pointer | null
  hover: Hover | null
  canvas: HTMLCanvasElement
  signal: AbortSignal
  world: World
  setWorld: SetWorldFn
}

export type InitFn = (state: AppState) => void

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle'
>
