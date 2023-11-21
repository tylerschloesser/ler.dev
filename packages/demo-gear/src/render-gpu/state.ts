import mainFrag from './shaders/main.frag.glsl'
import mainVert from './shaders/main.vert.glsl'
import { initProgram } from './util.js'

export interface GpuState {
  programs: {
    main: {
      program: WebGLProgram
    }
  }
}

export function initGpuState(
  gl: WebGL2RenderingContext,
): GpuState {
  return {
    programs: {
      main: {
        program: initMainProgram(gl),
      },
    },
  }
}

function initMainProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['main'] {
  return {
    program: initProgram(gl, {
      vert: mainVert,
      frag: mainFrag,
    }),
  }
}
