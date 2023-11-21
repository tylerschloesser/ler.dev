import invariant from 'tiny-invariant'
import gridFrag from './shaders/grid.frag.glsl'
import gridVert from './shaders/grid.vert.glsl'
import {
  WebGLAttributeLocation,
  getAttribLocation,
  getUniformLocation,
  initProgram,
} from './util.js'

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
      }
    }
  }
  buffers: {
    square: WebGLBuffer
  }
}

export function initGpuState(
  gl: WebGL2RenderingContext,
): GpuState {
  return {
    programs: {
      grid: initGridProgram(gl),
    },
    buffers: {
      square: initSquareBuffer(gl),
    },
  }
}

function initGridProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['grid'] {
  const program = initProgram(gl, {
    vert: gridVert,
    frag: gridFrag,
  })
  return {
    program,
    attributes: {
      vertex: getAttribLocation(gl, program, 'aVertex'),
    },
    uniforms: {
      viewport: getUniformLocation(
        gl,
        program,
        'uViewport',
        false,
      ),
      tileSize: getUniformLocation(
        gl,
        program,
        'uTileSize',
        false,
      ),
      camera: getUniformLocation(
        gl,
        program,
        'uCamera',
        false,
      ),
      pixelRatio: getUniformLocation(
        gl,
        program,
        'uPixelRatio',
        false,
      ),
    },
  }
}

function initSquareBuffer(
  gl: WebGL2RenderingContext,
): WebGLBuffer {
  const buffer = gl.createBuffer()
  invariant(buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      -1.0, -1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
    ]),
    gl.STATIC_DRAW,
  )
  return buffer
}
