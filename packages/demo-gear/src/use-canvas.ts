import { useEffect, useState } from 'react'
import { InitCanvasFn } from './types.js'

export function useCanvas(
  init: InitCanvasFn,
): React.Dispatch<React.SetStateAction<HTMLCanvasElement | null>> {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas) {
      return
    }
    init(canvas)
  }, [canvas])

  return setCanvas
}
