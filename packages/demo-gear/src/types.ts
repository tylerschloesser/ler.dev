export type InitCanvasFn = (canvas: HTMLCanvasElement) => void
export type InitPointerFn = (args: {
  canvas: HTMLCanvasElement
  size: { x: number; y: number }
  offset: { x: number; y: number }
}) => void

export type initKeyboardFn = (args: { canvas: HTMLCanvasElement }) => void
