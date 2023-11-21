import invariant from 'tiny-invariant'
import { initGearBuffers } from '../render-cpu/init-gear-buffers.js'
import { initMatrices } from './matrices.js'
import gridFrag from './shaders/grid.frag.glsl'
import gridVert from './shaders/grid.vert.glsl'
import mainFrag from './shaders/main.frag.glsl'
import mainVert from './shaders/main.vert.glsl'
import { GpuState } from './types.js'
import {
  getAttribLocation,
  getUniformLocation,
  initProgram,
} from './util.js'

export function initGpuState(
  gl: WebGL2RenderingContext,
): GpuState {
  return {
    programs: {
      grid: initGridProgram(gl),
      main: initMainProgram(gl),
    },
    buffers: {
      square: initSquareBuffer(gl),
      gears: initGearBuffers(gl),
    },
    matrices: initMatrices(),
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
      zoom: getUniformLocation(gl, program, 'uZoom', false),
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
      model: getUniformLocation(
        gl,
        program,
        'uModel',
        false,
      ),
      view: getUniformLocation(gl, program, 'uView', false),
      projection: getUniformLocation(
        gl,
        program,
        'uProjection',
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
