type Milliseconds = number

export interface ConstructorArgs {
  container: HTMLElement
}

export class EngineV2 {
  readonly container: HTMLElement
  readonly canvas: HTMLCanvasElement

  constructor({ container }: ConstructorArgs) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.container.appendChild(this.canvas)
    window.requestAnimationFrame(this.handleFrame.bind(this))
  }

  private handleFrame(timestamp: Milliseconds) {
    window.requestAnimationFrame(this.handleFrame.bind(this))
  }

  cleanup() {
    this.canvas.remove()
  }
}
