import { ZodError } from 'zod'
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
    version: 1,
    gears: {},
    tiles: {},
    belts: {},
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
