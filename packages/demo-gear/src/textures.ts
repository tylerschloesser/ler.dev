import { useEffect, useState } from 'react'
import { Textures } from './types.js'

export function useTextures(): Textures | null {
  const [textures, setTextures] = useState<Textures | null>(
    null,
  )

  useEffect(() => {
    setTextures({
      gear: {},
    })
  }, [])

  return textures
}
