import { useCallback, useEffect, useState } from 'react'
import { SetWorldFn, World } from '../types.js'
import {
  clearWorld,
  getDefaultWorld,
  initWorld,
  saveWorld,
} from '../world.js'

export function useWorld(): [World | null, SetWorldFn] {
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

  return [world, setWorld]
}

export type SaveWorldFn = () => Promise<void>
export function useSaveWorld(world?: World): SaveWorldFn {
  return useCallback(async () => {
    if (world) {
      await saveWorld(world)
    }
  }, [world])
}

export type ResetWorldFn = () => Promise<void>
export function useResetWorld(
  setWorld?: SetWorldFn,
): ResetWorldFn {
  return useCallback(async () => {
    if (setWorld) {
      await clearWorld()
      setWorld(await getDefaultWorld())
    }
  }, [setWorld])
}
