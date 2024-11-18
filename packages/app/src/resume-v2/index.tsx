import * as PIXI from 'pixi.js'
import { useEffect, useMemo, useRef } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function ResumeV2() {
  const size = useMemo(
    () => new Vec2(window.innerWidth, window.innerHeight),
    [],
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const app = new PIXI.Application()

    // controller.signal.addEventListener('abort', () => {
    //   try {
    //     app.stop()
    //     app.destroy()
    //   } catch (_e) {
    //     console.debug('Swallowing error')
    //   }
    // })
    ;(async () => {
      invariant(canvasRef.current)
      await app.init({
        canvas: canvasRef.current,
        width: size.x,
        height: size.y,
        autoStart: false,
      })

      const rect = new PIXI.Graphics()
      rect.rect(0, 0, 100, 100)
      rect.fill('blue')
      app.stage.addChild(rect)

      if (!controller.signal.aborted) {
        app.start()
        appRef.current = app
      }

      // app.ticker.add((ticker) => {
      //   // console.log(ticker.deltaTime)
      // })
    })()
    return () => {
      if (appRef.current) {
        appRef.current.destroy()
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={size.x}
      height={size.y}
    />
  )
}
