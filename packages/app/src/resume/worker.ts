import * as PIXI from 'pixi.js'
import Prando from 'prando'
import { createNoise3D } from 'simplex-noise'
import invariant from 'tiny-invariant'
import { Message, MessageType } from './message'
import { Vec2 } from './vec2'

let canvas: OffscreenCanvas

self.addEventListener('message', async (ev) => {
  const message = Message.parse(ev.data)

  switch (message.type) {
    case MessageType.enum.Init: {
      invariant(!canvas)
      canvas = message.canvas

      const viewport = new Vec2(message.viewport)

      const app = new PIXI.Application()
      const rng = new Prando(0)
      const noise = createNoise3D(rng.next.bind(rng))

      PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter)

      await app.init({
        canvas,
        width: viewport.x,
        height: viewport.y,
        backgroundAlpha: 0,
      })

      const rect = new PIXI.Graphics()
      app.stage.addChild(rect)

      app.ticker.add((ticker) => {
        rect.rotation += ticker.deltaTime * 1e-2

        const now = self.performance.now()

        const hue = noise(0, 0, now * 1e-5) * 360

        const style = `hsl(${hue.toFixed(2)}, 50%, 50%)`
        rect.clear()

        rect.rect(0, 0, 100, 100)
        rect.position.set(
          canvas.width / 2,
          canvas.height / 2,
        )
        rect.pivot.set(100 / 2, 100 / 2)
        rect.fill(style)
      })

      break
    }
    case MessageType.enum.Viewport: {
      invariant(canvas)
      const viewport = new Vec2(message.viewport)

      canvas.width = viewport.x
      canvas.height = viewport.y

      break
    }
  }
})
