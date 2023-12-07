import { NavigateFunction } from 'react-router-dom'
import * as z from 'zod'

// export const NodeType = z.enum([
//   'Gear',
//   'BeltStraight',
//   'BeltIntersection',
// ])

export const SimpleVec2 = z.strictObject({
  x: z.number(),
  y: z.number(),
})
export type SimpleVec2 = z.infer<typeof SimpleVec2>

export const GearId = z.string()
export type GearId = z.infer<typeof GearId>

export const BeltId = z.string()
export type BeltId = z.infer<typeof BeltId>

export const TileId = z.string()
export type TileId = z.infer<typeof TileId>

export const ResourceType = z.enum(['Fuel'])
export type ResourceType = z.infer<typeof ResourceType>

export const Tile = z.strictObject({
  gearId: GearId.optional(),
  resourceType: ResourceType.optional(),
  beltId: BeltId.optional(),
})
export type Tile = z.infer<typeof Tile>

export const ConnectionType = z.enum([
  'Adjacent',
  'Chain',
  'Attach',
  'Belt',
])
export type ConnectionType = z.infer<typeof ConnectionType>

export const AdjacentConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Adjacent),
  gearId: GearId,
  multiplier: z.number(),
})
export type AdjacentConnection = z.infer<
  typeof AdjacentConnection
>

export const ChainConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Chain),
  gearId: GearId,
  multiplier: z.number(),
})
export type ChainConnection = z.infer<
  typeof ChainConnection
>

export const AttachConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Attach),
  gearId: GearId,
  multiplier: z.number(),
})
export type AttachConnection = z.infer<
  typeof AttachConnection
>

export const BeltConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Belt),
  beltId: BeltId,
  multiplier: z.number(),
})
export type BeltConnection = z.infer<typeof BeltConnection>

export const Connection = z.discriminatedUnion('type', [
  AdjacentConnection,
  ChainConnection,
  AttachConnection,
  BeltConnection,
])
export type Connection = z.infer<typeof Connection>

export const GearBehaviorType = z.enum([
  'Force',
  'Friction',
])
export type GearBehaviorType = z.infer<
  typeof GearBehaviorType
>

export const ForceGearBehavior = z.strictObject({
  type: z.literal(GearBehaviorType.enum.Force),
  direction: z.union([z.literal('cw'), z.literal('ccw')]),
  magnitude: z.number(),
  governer: z.number(),
})
export type ForceGearBehavior = z.infer<
  typeof ForceGearBehavior
>

export const FrictionGearBehavior = z.strictObject({
  type: z.literal(GearBehaviorType.enum.Friction),
  coeffecient: z.number(),
  magnitude: z.number(),
})
export type FrictionGearBehavior = z.infer<
  typeof FrictionGearBehavior
>

export const GearBehavior = z.discriminatedUnion('type', [
  ForceGearBehavior,
  FrictionGearBehavior,
])
export type GearBehavior = z.infer<typeof GearBehavior>

export const Gear = z.strictObject({
  id: GearId,
  position: SimpleVec2,
  center: SimpleVec2,
  radius: z.number(),
  angle: z.number(),
  velocity: z.number(),
  mass: z.number(),
  connections: z.array(Connection),
  behavior: GearBehavior.optional(),
})
export type Gear = z.infer<typeof Gear>

export const BeltDirection = z.union([
  z.literal('x'),
  z.literal('y'),
])
export type BeltDirection = z.infer<typeof BeltDirection>

export const BeltPath = z.array(SimpleVec2)
export type BeltPath = z.infer<typeof BeltPath>

export const BeltType = z.enum(['Straight', 'Intersection'])
export type BeltType = z.infer<typeof BeltType>

export const StraightBelt = z.strictObject({
  type: z.literal(BeltType.enum.Straight),
  id: BeltId,
  path: BeltPath,
  direction: BeltDirection,
  offset: z.number(),
  velocity: z.number(),
  connections: z.array(Connection),
})
export type StraightBelt = z.infer<typeof StraightBelt>

export const IntersectionBelt = z.strictObject({
  type: z.literal(BeltType.enum.Intersection),
  id: BeltId,
  position: SimpleVec2,
  offset: z.number(),
  velocity: z.number(),
  connections: z.array(Connection),
})
export type IntersectionBelt = z.infer<
  typeof IntersectionBelt
>

export const Belt = z.discriminatedUnion('type', [
  StraightBelt,
  IntersectionBelt,
])
export type Belt = z.infer<typeof Belt>

export const World = z.strictObject({
  version: z.number(),
  gears: z.record(GearId, Gear),
  tiles: z.record(TileId, Tile),
  belts: z.record(BeltId, Belt),
})
export type World = z.infer<typeof World>

export enum HandType {
  Build = 'build',
  ApplyForce = 'apply-force',
  ApplyFriction = 'apply-friction',
  Configure = 'configure',
  AddResource = 'add-resource',
  AddBelt = 'add-belt',
  Delete = 'delete',
}

export interface BuildHand {
  type: HandType.Build
  gear: PartialGear
  valid: boolean
  chain: Gear | null
  onChangeValid?(valid: boolean): void
}

export interface ApplyForceHand {
  type: HandType.ApplyForce
  position: SimpleVec2 | null
  active: boolean
  direction: 'cw' | 'ccw'
  magnitude: number
  gear: Gear | null
  runningEnergyDiff: number
}

export interface ApplyFrictionHand {
  type: HandType.ApplyFriction
  position: SimpleVec2 | null
  active: boolean
  coeffecient: number
  gear: Gear | null
  runningEnergyDiff: number
}

export interface ConfigureHand {
  type: HandType.Configure
  gear: Gear | null
}

export interface AddResourceHand {
  type: HandType.AddResource
  position: SimpleVec2
  valid: boolean
}

export interface AddBeltHand {
  type: HandType.AddBelt
  belts: Belt[]
  valid: boolean
}

export interface DeleteHand {
  type: HandType.Delete
  position: SimpleVec2
  size: number
  gearIds: Set<GearId>
  tileIds: Set<TileId>
}

export type Hand =
  | BuildHand
  | ApplyForceHand
  | ApplyFrictionHand
  | ConfigureHand
  | AddResourceHand
  | AddBeltHand
  | DeleteHand

export type SetWorldFn = (world: World) => void

export const Camera = z.strictObject({
  position: SimpleVec2,
  zoom: z.number(),
})
export type Camera = z.infer<typeof Camera>

export type PointerListenerFn = (
  context: IAppContext,
  e: PointerEvent,
  position: Readonly<SimpleVec2>,
) => void
export type CameraListenerFn = (
  context: IAppContext,
) => void
export type CenterTileIdListener = (
  context: IAppContext,
) => void
export type TickListenerFn = (context: IAppContext) => void

export interface Viewport {
  size: SimpleVec2
  pixelRatio: number
}

export interface IAppContext {
  canvas: {
    container: HTMLDivElement
    gpu: HTMLCanvasElement
  }
  viewport: Viewport
  signal: AbortSignal
  world: World
  setWorld: SetWorldFn
  hand: Hand | null

  camera: Camera
  tileSize: number

  centerTileId: TileId
  centerTileIdListeners: Set<CenterTileIdListener>

  pointerListeners: Set<PointerListenerFn>
  cameraListeners: Set<CameraListenerFn>
  tickListeners: Set<TickListenerFn>

  navigate: NavigateFunction
}

export type InitFn = (context: IAppContext) => Promise<void>

export type PartialGear = Pick<
  Gear,
  | 'center'
  | 'radius'
  | 'angle'
  | 'velocity'
  | 'connections'
  | 'behavior'
>
