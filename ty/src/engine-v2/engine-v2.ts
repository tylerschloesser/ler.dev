import { InitFn, RenderFn } from '../common/engine'
import { preventScroll, updateSize } from './util'

type Milliseconds = number

export interface ConstructorArgs {
  container: HTMLElement
  init: InitFn
  render: RenderFn
}

export class EngineV2 {
  readonly container: HTMLElement
  readonly canvas: HTMLCanvasElement
  readonly controller: AbortController

  constructor({ container }: ConstructorArgs) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.container.appendChild(this.canvas)
    this.controller = new AbortController()

    preventScroll(this.controller.signal)
    updateSize(this.container, this.canvas)

    window.requestAnimationFrame(this.handleFrame.bind(this))
  }

  private handleFrame(timestamp: Milliseconds) {
    if (this.controller.signal.aborted) {
      return
    }
    console.log('handle frame')
    window.requestAnimationFrame(this.handleFrame.bind(this))
  }
}
