import * as PIXI from 'pixi.js'
import { useEffect, useMemo, useRef } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function ResumeV2() {
  const size = useMemo(
    () => new Vec2(window.innerWidth, window.innerHeight),
    [],
  )

  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    ;(async () => {
      invariant(canvas.current)
      const app = new PIXI.Application()
      await app.init({
        canvas: canvas.current,
        width: size.x,
        height: size.y,
      })

      const rect = new PIXI.Graphics()
      rect.rect(0, 0, 100, 100)
      rect.fill('blue')
      app.stage.addChild(rect)
    })()
  }, [])

  return (
    <canvas ref={canvas} width={size.x} height={size.y} />
  )
}
