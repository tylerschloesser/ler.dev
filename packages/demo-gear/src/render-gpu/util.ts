import invariant from 'tiny-invariant'

type ShaderType = number
type ShaderSource = string
type WebGLAttributeLocation = number

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
