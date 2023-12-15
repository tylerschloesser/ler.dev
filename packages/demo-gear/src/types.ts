import { NavigateFunction } from 'react-router-dom'
import * as z from 'zod'

export const SimpleVec2 = z.strictObject({
  x: z.number(),
  y: z.number(),
})
export type SimpleVec2 = z.infer<typeof SimpleVec2>

export const EntityId = z.string()
export type EntityId = z.infer<typeof EntityId>

export const TileId = z.string()
export type TileId = z.infer<typeof TileId>

export const ResourceType = z.enum(['Fuel'])
export type ResourceType = z.infer<typeof ResourceType>

export const ItemType = z.enum(['Fuel'])
export type ItemType = z.infer<typeof ItemType>

export const Tile = z.strictObject({
  entityId: EntityId.optional(),
  resourceType: ResourceType.optional(),
})
export type Tile = z.infer<typeof Tile>

export const NetworkId = z.string()
export type NetworkId = z.infer<typeof NetworkId>

export const Network = z.strictObject({
  id: NetworkId,
  rootId: EntityId,
  entityIds: z.record(EntityId, z.literal(true)),
  mass: z.number(),
})
export type Network = z.infer<typeof Network>

export const ConnectionType = z.enum([
  'Adjacent',
  'Chain',
  'Attach',
  'Belt',
])
export type ConnectionType = z.infer<typeof ConnectionType>

export const AdjacentConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Adjacent),
  entityId: EntityId,
  multiplier: z.number(),
})
export type AdjacentConnection = z.infer<
  typeof AdjacentConnection
>

export const ChainConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Chain),
  entityId: EntityId,
  multiplier: z.number(),
})
export type ChainConnection = z.infer<
  typeof ChainConnection
>

export const AttachConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Attach),
  entityId: EntityId,
  multiplier: z.number(),
})
export type AttachConnection = z.infer<
  typeof AttachConnection
>

export const BeltConnection = z.strictObject({
  type: z.literal(ConnectionType.enum.Belt),
  entityId: EntityId,
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

export const EntityType = z.enum(['Gear', 'Belt'])
export type EntityType = z.infer<typeof EntityType>

const EntityBase = z.strictObject({
  id: EntityId,
  networkId: NetworkId,
  position: SimpleVec2,
  size: SimpleVec2,
  connections: z.array(Connection),
  velocity: z.number(),
  mass: z.number(),
})

export const GearEntity = EntityBase.extend({
  type: z.literal(EntityType.enum.Gear),
  center: SimpleVec2,
  radius: z.number(),
  angle: z.number(),
  behavior: GearBehavior.optional(),
})
export type GearEntity = z.infer<typeof GearEntity>

export const BeltDirection = z.union([
  z.literal('x'),
  z.literal('y'),
])
export type BeltDirection = z.infer<typeof BeltDirection>

export const Rotation = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
])
export type Rotation = z.infer<typeof Rotation>

export const BeltPath = z.array(SimpleVec2)
export type BeltPath = z.infer<typeof BeltPath>

export const BeltItem = z.strictObject({
  type: ItemType,
  position: z.number(),
})
export type BeltItem = z.infer<typeof BeltItem>

export const BeltTurn = z.enum(['None', 'Left', 'Right'])
export type BeltTurn = z.infer<typeof BeltTurn>

export const BeltEntity = EntityBase.extend({
  type: z.literal(EntityType.enum.Belt),
  direction: BeltDirection,
  offset: z.number(),
  items: z.array(BeltItem),
  rotation: Rotation,
  turn: BeltTurn,
})
export type BeltEntity = z.infer<typeof BeltEntity>

export const Belt = BeltEntity
export type Belt = z.infer<typeof Belt>

export const Gear = GearEntity
export type Gear = z.infer<typeof Gear>

export const Entity = z.discriminatedUnion('type', [
  GearEntity,
  BeltEntity,
])
export type Entity = z.infer<typeof Entity>

export const World = z.strictObject({
  version: z.number(),
  entities: z.record(EntityId, Entity),
  tiles: z.record(TileId, Tile),
  networks: z.record(NetworkId, Network),
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
  valid: boolean
  entities: Record<EntityId, Entity>
  networks: Record<NetworkId, Network>
}

export interface ApplyForceHand {
  type: HandType.ApplyForce
  position: SimpleVec2 | null
  active: boolean
  direction: 'cw' | 'ccw'
  magnitude: number
  gear: GearEntity | null
}

export interface ApplyFrictionHand {
  type: HandType.ApplyFriction
  position: SimpleVec2 | null
  active: boolean
  coeffecient: number
  gear: GearEntity | null
}

export interface ConfigureHand {
  type: HandType.Configure
  gear: GearEntity | null
}

export interface AddResourceHand {
  type: HandType.AddResource
  position: SimpleVec2
  valid: boolean
}

export interface DeleteHand {
  type: HandType.Delete
  position: SimpleVec2
  size: number
  entityIds: Set<EntityId>
  tileIds: Set<TileId>
}

export type Hand =
  | BuildHand
  | ApplyForceHand
  | ApplyFrictionHand
  | ConfigureHand
  | AddResourceHand
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
export type BuildVersionListenerFn = (
  version: number,
) => void

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

  buildVersion: number
  buildVersionListeners: Set<BuildVersionListenerFn>

  navigate: NavigateFunction
}

export type InitFn = (context: IAppContext) => Promise<void>
