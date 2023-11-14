import { RenderFn } from '../common/engine/index.js'
import {
  initDebug,
  preventScroll,
  updateSize,
} from './util.js'

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
  private readonly debug: HTMLElement

  private lastFrame: number = 0
  private frames: number = 0

  constructor({ container, render }: ConstructorArgs) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')! // TODO error handling
    this.container.appendChild(this.canvas)
    this.controller = new AbortController()
    this.render = render
    this.debug = initDebug(this.container)

    preventScroll(this.controller.signal)
    updateSize(this.container, this.canvas)
  }

  start() {
    this.lastFrame = window.performance.now()
    window.requestAnimationFrame(
      this.handleFrame.bind(this),
    )
  }

  private handleFrame(timestamp: Milliseconds) {
    if (this.controller.signal.aborted) {
      return
    }

    if (
      Math.floor(this.lastFrame / 1000) !==
      Math.floor(timestamp / 1000)
    ) {
      this.debug.textContent = `FPS: ${this.frames}`
      this.frames = 0
    }
    this.frames++

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

    window.requestAnimationFrame(
      this.handleFrame.bind(this),
    )
  }
}
