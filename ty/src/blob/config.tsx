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
