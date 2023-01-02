export enum RenderMethod {
  Simple = 'simple',
  Bezier = 'bezier',
}

export interface Config {
  parts: number
  xScale: number
  yScale: number
  zScale: number
  renderMethod?: RenderMethod
}

export type RenderFn = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  config: Config,
  timestamp: number,
) => void
