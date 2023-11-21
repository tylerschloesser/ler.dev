import { useEffect, useState } from 'react'
import { Textures } from './types.js'

export function useTextures(): Textures | null {
  const [textures, setTextures] = useState<Textures | null>(
    null,
  )

  useEffect(() => {
    generateTextures().then(setTextures)
  }, [])

  return textures
}

async function generateTextures(): Promise<Textures> {
  return {
    gear: {},
  }
}
