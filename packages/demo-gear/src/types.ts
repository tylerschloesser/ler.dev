import * as z from 'zod'

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

export enum HandType {
  Build = 'build',
  Accelerate = 'accelerate',
}

interface BaseHand<T extends HandType> {
  type: T
  position: SimpleVec2 | null
}

export interface BuildHand
  extends BaseHand<HandType.Build> {
  radius: number
  valid: boolean
  chain: Gear | null
  connections: Connection[]
  onChangeValid?(valid: boolean): void
}

export interface AccelerateHand
  extends BaseHand<HandType.Accelerate> {
  active: boolean
  direction: number
  gear: Gear | null
  onChangeGear?(gear: Gear | null): void
}

export type Hand = BuildHand | AccelerateHand

export type SetWorldFn = (world: World) => void

export interface Camera {
  position: SimpleVec2
  zoom: number
}

export type PointerListenerFn = (
  state: AppState,
  e: PointerEvent,
  position: Readonly<SimpleVec2>,
) => void
export type CameraListenerFn = (state: AppState) => void

type Texture = Blob

export interface Textures {
  gears: Record<number, Texture>
}

export interface AppState {
  canvas: {
    container: HTMLDivElement
    cpu: HTMLCanvasElement
    gpu: HTMLCanvasElement
  }
  viewport: {
    size: SimpleVec2
    pixelRatio: number
  }
  signal: AbortSignal
  world: World
  setWorld: SetWorldFn
  hand: Hand | null

  camera: Camera
  tileSize: number

  pointerListeners: Set<PointerListenerFn>
  cameraListeners: Set<CameraListenerFn>

  textures: Textures
}

export type InitFn = (state: AppState) => Promise<void>

export type PartialGear = Pick<
  Gear,
  'position' | 'radius' | 'angle'
>
