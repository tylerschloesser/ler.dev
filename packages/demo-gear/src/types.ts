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
  'Adjacent',
  'Chain',
  'Attach',
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
  Build = 'build',
  ApplyForce = 'apply-force',
}

export interface BuildPointer {
  type: PointerType.Build
  position: Vec2
  radius: number
  valid: boolean
  chain: Gear | null
  attach: Gear | null
  connections: Connection[]
}

export interface ApplyForcePointer {
  type: PointerType.ApplyForce
  position: Vec2
  acceleration: number
  gear: Gear | null
}

export type Pointer = BuildPointer | ApplyForcePointer

export type SetWorldFn = (world: World) => void

export interface AppState {
  pointer: Pointer | null
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
