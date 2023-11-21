import invariant from 'tiny-invariant'
import mainFrag from './shaders/main.frag.glsl'
import mainVert from './shaders/main.vert.glsl'
import {
  WebGLAttributeLocation,
  getAttribLocation,
  getUniformLocation,
  initProgram,
} from './util.js'

export interface GpuState {
  programs: {
    main: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        viewport: WebGLUniformLocation
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
      main: initMainProgram(gl),
    },
    buffers: {
      square: initSquareBuffer(gl),
    },
  }
}

function initMainProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['main'] {
  const program = initProgram(gl, {
    vert: mainVert,
    frag: mainFrag,
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
