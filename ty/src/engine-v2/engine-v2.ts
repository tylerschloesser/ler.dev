import { InitFn, RenderFn } from '../common/engine'
import { preventScroll, updateSize } from './util'

type Milliseconds = number

export interface ConstructorArgs {
  container: HTMLElement
  render: RenderFn
}

export class EngineV2 {
  readonly container: HTMLElement
  readonly canvas: HTMLCanvasElement
  readonly controller: AbortController

  private readonly context: CanvasRenderingContext2D
  private readonly render: RenderFn

  private lastFrame: number = 0

  constructor({ container, render }: ConstructorArgs) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')! // TODO error handling
    this.container.appendChild(this.canvas)
    this.controller = new AbortController()
    this.render = render

    preventScroll(this.controller.signal)
    updateSize(this.container, this.canvas)
  }

  start() {
    this.lastFrame = window.performance.now()
    window.requestAnimationFrame(this.handleFrame.bind(this))
  }

  private handleFrame(timestamp: Milliseconds) {
    if (this.controller.signal.aborted) {
      return
    }

    const elapsed = timestamp - this.lastFrame
    this.lastFrame = timestamp

    this.render({
      context: this.context,
      elapsed,
      timestamp,

      // TODO clean this up
      canvas: null!,
      config: null!,
      debug: null!,
      scale: null!,
      viewport: null!,
    })

    window.requestAnimationFrame(this.handleFrame.bind(this))
  }
}
