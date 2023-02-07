import Color from 'color'
import { times } from 'lodash'
import { NUM_COLS, NUM_ROWS } from './config'
import { Grid } from './types'

export function convertGridToDataUrl(grid: Grid) {
  const canvas = document.createElement('canvas')
  const width = (canvas.width = NUM_COLS)
  const height = (canvas.height = NUM_ROWS)
  const context = canvas.getContext('2d')!

  const imageData = context.createImageData(width, height)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const row = Math.floor(i / 4 / 50)
    const col = (i / 4) % 50

    const color = Color(grid[row][col])
    imageData.data[i + 0] = Math.round(color.red())
    imageData.data[i + 1] = Math.round(color.green())
    imageData.data[i + 2] = Math.round(color.blue())
    // rgb are 0-255, alpha is 0-1
    imageData.data[i + 3] = Math.round(color.alpha() * 255)
  }
  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

export async function convertDataUrlToGrid(dataUrl: string): Promise<Grid> {
  const blob = await (await fetch(dataUrl)).blob()
  const image = new Image()
  image.src = URL.createObjectURL(blob)

  const grid: Grid = times(NUM_ROWS, () => times(NUM_COLS, () => ''))

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const width = (canvas.width = NUM_COLS)
      const height = (canvas.height = NUM_ROWS)
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, width, height)

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i + 0]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        // ignore alpha for now
        const color = new Color({ r, g, b })

        const row = Math.floor(i / 4 / NUM_ROWS)
        const col = (i / 4) % NUM_COLS
        grid[row][col] = color.hsl().string()
      }

      resolve(grid)
    }
  })
}
