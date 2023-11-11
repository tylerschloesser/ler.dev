export type Vec2 = { x: number; y: number }

export type InitCanvasFn = (canvas: HTMLCanvasElement) => void
export type InitPointerFn = (args: { canvas: HTMLCanvasElement }) => void
export type initKeyboardFn = (args: { canvas: HTMLCanvasElement }) => void
