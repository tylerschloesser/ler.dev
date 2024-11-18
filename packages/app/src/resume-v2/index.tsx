import * as PIXI from 'pixi.js'
import Prando from 'prando'
import { useEffect, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

async function init() {
  const canvas = document.createElement('canvas')
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  const app = new PIXI.Application()
  const size = new Vec2(
    window.innerWidth,
    window.innerHeight,
  ).mul(window.devicePixelRatio)
  await app.init({
    canvas,
    width: size.x,
    height: size.y,
    autoStart: false,
  })

  const rng = new Prando(0)
  const noise = createNoise3D(rng.next.bind(rng))

  return { canvas, app, noise }
}

type State = Awaited<ReturnType<typeof init>>

// @refresh reset
//
export function ResumeV2() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State | null>(null)
  useEffect(() => {
    init().then(setState)
  }, [])

  useEffect(() => {
    if (!state) {
      return
    }

    invariant(container.current)
    container.current.append(state.canvas)

    const rect = new PIXI.Graphics()
    const size = new Vec2(200)

    state.app.stage.addChild(rect)
    state.app.start()

    state.app.ticker.add((ticker) => {
      rect.rotation += ticker.deltaTime * 1e-2

      const now = self.performance.now()

      const hue = state.noise(0, 0, now * 1e-5) * 360

      const style = `hsl(${hue.toFixed(2)}, 50%, 50%)`
      rect.clear()

      rect.rect(0, 0, size.x, size.y)
      rect.position.set(
        state.canvas.width / 2,
        state.canvas.height / 2,
      )
      rect.pivot.set(size.x / 2, size.y / 2)
      rect.fill(style)
    })

    return () => {
      state.app.destroy(
        {
          removeView: true,
        },
        {
          children: true,
          context: true,
        },
      )
      if (container.current) {
        container.current.removeChild(state.canvas)
      } else {
        console.debug(`container is ${container.current}`)
      }
    }
  }, [state])

  return <div ref={container} />
}
