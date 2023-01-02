export enum RenderMethod {
  Simple,
  Bezier,
}

export interface Config {
  parts: number
  xScale: number
  yScale: number
  zScale: number
  renderMethod?: RenderMethod
}
