import invariant from 'tiny-invariant'
import {
  ShaderSource,
  ShaderType,
  WebGLAttributeLocation,
} from './types.js'

export function initProgram(
  gl: WebGL2RenderingContext,
  shaders: { vert: string; frag: string },
): WebGLProgram {
  const program = gl.createProgram()
  invariant(program)

  const vert = initShader(
    gl,
    gl.VERTEX_SHADER,
    shaders.vert,
  )
  gl.attachShader(program, vert)

  const frag = initShader(
    gl,
    gl.FRAGMENT_SHADER,
    shaders.frag,
  )
  gl.attachShader(program, frag)

  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    invariant(
      false,
      `Error linking program: ${gl.getProgramInfoLog(
        program,
      )}`,
    )
  }

  return program
}

function initShader(
  gl: WebGL2RenderingContext,
  type: ShaderType,
  source: ShaderSource,
): WebGLShader {
  const shader = gl.createShader(type)
  invariant(shader)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    invariant(
      false,
      `Error compiling shader: ${gl.getShaderInfoLog(
        shader,
      )}`,
    )
  }
  return shader
}

export function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  required?: true,
): WebGLUniformLocation
export function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  required: false,
): WebGLUniformLocation
export function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  required = true,
) {
  const location = gl.getUniformLocation(program, name)
  if (required) {
    invariant(location)
  }
  return location
}

export function getAttribLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLAttributeLocation {
  const location = gl.getAttribLocation(program, name)
  invariant(location !== -1)
  return location
}
