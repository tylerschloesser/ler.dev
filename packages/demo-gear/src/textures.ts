import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import { GEAR_RADIUSES, TWO_PI } from './const.js'
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
  const canvas = document.createElement('canvas')

  const context = canvas.getContext('2d')
  invariant(context)

  // TODO
  const scale = 100

  const gears: Textures['gears'] = {}

  for (const radius of GEAR_RADIUSES) {
    const vx = radius * 2 * scale
    const vy = radius * 2 * scale
    canvas.width = vx
    canvas.height = vy
    context.clearRect(0, 0, vx, vy)

    context.fillStyle = 'orange'
    context.beginPath()
    context.arc(vx / 2, vy / 2, radius * scale, 0, TWO_PI)
    context.fill()
    context.closePath()

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        invariant(blob)
        resolve(blob)
      })
    })

    gears[radius] = blob
  }

  canvas.remove()

  // TODO measure time
  console.log('done generating textures')

  return { gears }
}
