export type ShaderType = number
export type ShaderSource = string
export type WebGLAttributeLocation = number

export interface GpuState {
  programs: {
    grid: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        viewport: WebGLUniformLocation | null
        tileSize: WebGLUniformLocation | null
        camera: WebGLUniformLocation | null
        pixelRatio: WebGLUniformLocation | null
        zoom: WebGLUniformLocation | null
      }
    }
    main: {
      program: WebGLProgram
    }
  }
  buffers: {
    square: WebGLBuffer
    gears: Record<number, { vertex: WebGLBuffer }>
  }
}
