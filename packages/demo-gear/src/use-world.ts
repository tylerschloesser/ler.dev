import { useCallback, useEffect, useState } from 'react'
import { World } from './types.js'
import {
  clearWorld,
  getDefaultWorld,
  initWorld,
  saveWorld,
} from './world.js'

export interface UseWorld {
  save(): Promise<void>
  reset(): Promise<void>
  world: World | null
}

export function useWorld(): UseWorld {
  const [world, setWorld] = useState<World | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    initWorld().then(setWorld).catch(setError)
  }, [])

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const save = useCallback(async () => {
    if (world) {
      await saveWorld(world)
    }
  }, [world])

  const reset = useCallback(async () => {
    await clearWorld()
    setWorld(await getDefaultWorld())
  }, [])

  return {
    save,
    reset,
    world,
  }
}
