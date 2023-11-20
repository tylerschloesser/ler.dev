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

export interface Build {
  position: SimpleVec2 | null
  radius: number
  valid: boolean
  chain: Gear | null
  connections: Connection[]
}

export interface Accelerate {
  position: SimpleVec2 | null
  active: boolean
  direction: number
  gear: Gear | null
}

export type SetWorldFn = (world: World) => void

export enum PointerMode {
  Free = 'free',
  Build = 'build',
  Accelerate = 'accelerate',
}

export interface Pointer {
  position: SimpleVec2
  down: boolean
  mode: PointerMode
}

export interface Camera {
  position: SimpleVec2
  zoom: number
}

export interface Hand {
  position: Vec2 | null
}

export interface AppState {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  world: World
  setWorld: SetWorldFn
  pointer: Pointer
  hand: Hand

  camera: Camera
  tileSize: number

  accelerate: Accelerate | null
  build: Build | null
}

export type InitFn = (state: AppState) => void

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle'
>
