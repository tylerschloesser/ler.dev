export class EngineV2 {
  readonly container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    console.log('todo init')
  }

  cleanup() {
    console.log('todo cleanup')
  }
}
