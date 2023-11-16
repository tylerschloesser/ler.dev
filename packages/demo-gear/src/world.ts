import invariant from 'tiny-invariant'
import { ZodError } from 'zod'
import { addGear } from './add-gear.js'
import { GEAR_RADIUSES } from './const.js'
import { getConnections } from './get-connections.js'
import { World } from './types.js'

export const WORLD_KEY = 'world'

export async function loadWorld(): Promise<World | null> {
  const json = localStorage.getItem(WORLD_KEY)
  if (json === null) {
    return null
  }
  return World.parse(JSON.parse(json))
}

export async function saveWorld(
  world: World,
): Promise<void> {
  localStorage.setItem(WORLD_KEY, JSON.stringify(world))
}

export async function clearWorld(): Promise<void> {
  localStorage.removeItem(WORLD_KEY)
}

export async function getDefaultWorld(): Promise<World> {
  const world: World = {
    gears: {},
    tiles: {},
    debugConnections: false,
  }

  for (const { position, radius } of [
    {
      position: { x: 0, y: 0 },
      radius: 1,
    },
    {
      position: { x: 3, y: 0 },
      radius: 2,
    },
  ]) {
    invariant(GEAR_RADIUSES.includes(radius))
    addGear({
      position,
      radius,
      world,
      connections: getConnections({
        position,
        radius,
        world,
      }),
    })
  }

  return world
}

export async function initWorld(): Promise<World> {
  let world: World | null = null
  try {
    world = await loadWorld()
  } catch (e) {
    if (
      e instanceof ZodError &&
      self.confirm(
        'Saved world does not match schema. Reset?',
      )
    ) {
      await clearWorld()
      world = await getDefaultWorld()
      await saveWorld(world)
    } else {
      throw e
    }
  }

  if (!world) {
    world = await getDefaultWorld()
  }

  return world
}
