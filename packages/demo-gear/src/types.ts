import { NavigateFunction } from 'react-router-dom'
import * as z from 'zod'

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
  attachedGearId: GearId.optional(),
  resourceType: ResourceType.optional(),
  beltId: BeltId.optional(),
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
  radius: z.number(),
  angle: z.number(),
  velocity: z.number(),
  mass: z.number(),
  connections: z.array(Connection),
  behavior: GearBehavior.optional(),
})
export type Gear = z.infer<typeof Gear>

export const Belt = z.strictObject({
  id: BeltId,
  tilePositions: z.array(SimpleVec2),
})
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
  start: SimpleVec2
  end: SimpleVec2 | null
  valid: boolean
}

export type Hand =
  | BuildHand
  | ApplyForceHand
  | ApplyFrictionHand
  | ConfigureHand
  | AddResourceHand
  | AddBeltHand

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
  | 'position'
  | 'radius'
  | 'angle'
  | 'velocity'
  | 'connections'
  | 'behavior'
>
