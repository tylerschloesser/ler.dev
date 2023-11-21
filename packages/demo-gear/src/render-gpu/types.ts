import { mat4 } from 'gl-matrix'

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
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        model: WebGLUniformLocation
        view: WebGLUniformLocation
        projection: WebGLUniformLocation
        color: WebGLUniformLocation
      }
    }
  }
  buffers: {
    square: WebGLBuffer
  }
  textures: {
    gears: Record<number, WebGLTexture>
  }
  matrices: {
    model: mat4
    view: mat4
    projection: mat4
  }
}
