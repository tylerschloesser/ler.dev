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
        zoom: WebGLUniformLocation | null
      }
    }
    gearBody: {
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
    gearTeeth: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        model: WebGLUniformLocation
        view: WebGLUniformLocation
        projection: WebGLUniformLocation
        color: WebGLUniformLocation
        tileSize: WebGLUniformLocation
      }
    }
    chain: {
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
    outlineRect: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        model: WebGLUniformLocation
        view: WebGLUniformLocation
        projection: WebGLUniformLocation
        color: WebGLUniformLocation
        size: WebGLUniformLocation
      }
    }
    fillRect: {
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
    fillInstanced: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
        matrix: WebGLAttributeLocation
      }
      uniforms: {
        // view: WebGLUniformLocation
        // projection: WebGLUniformLocation
        transform: WebGLUniformLocation
        color: WebGLUniformLocation
      }
    }
  }
  buffers: {
    square: WebGLBuffer
    fillRect: WebGLBuffer
    outlineRect: WebGLBuffer
    gearBody: Record<
      number,
      {
        vertex: WebGLBuffer
        count: number
      }
    >
    gearTooth: WebGLBuffer
    fillInstancedMatrices: {
      data: Float32Array
      buffer: WebGLBuffer
      values: mat4[]
    }
  }
  matrices: {
    model: mat4
    view: mat4
    projection: mat4
  }
}
