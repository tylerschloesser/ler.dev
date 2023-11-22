import invariant from 'tiny-invariant'
import { GEAR_RADIUSES, TEETH, TWO_PI } from '../const.js'
import { initMatrices } from './matrices.js'
import gearBodyFrag from './shaders/gear-body.frag.glsl'
import gearBodyVert from './shaders/gear-body.vert.glsl'
import gearTeethFrag from './shaders/gear-teeth.frag.glsl'
import gearTeethVert from './shaders/gear-teeth.vert.glsl'
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

export async function initGpuState(
  gl: WebGL2RenderingContext,
): Promise<GpuState> {
  return {
    programs: {
      grid: initGridProgram(gl),
      main: initMainProgram(gl),
      gearBody: initGearBodyProgram(gl),
      gearTeeth: initGearTeethProgram(gl),
    },
    buffers: {
      square: initSquareBuffer(gl),
      gearBody: initGearBodyBuffers(gl),
      gearTooth: initGearToothBuffer(gl),
    },
    textures: await initTextures(gl),
    matrices: initMatrices(),
  }
}

function initGearBodyProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['gearBody'] {
  const program = initProgram(gl, {
    vert: gearBodyVert,
    frag: gearBodyFrag,
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
      color: getUniformLocation(
        gl,
        program,
        'uColor',
        false,
      ),
    },
  }
}

function initGearTeethProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['gearTeeth'] {
  const program = initProgram(gl, {
    vert: gearTeethVert,
    frag: gearTeethFrag,
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
      color: getUniformLocation(
        gl,
        program,
        'uColor',
        false,
      ),
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
      color: getUniformLocation(
        gl,
        program,
        'uColor',
        false,
      ),
      sampler: getUniformLocation(gl, program, 'uSampler'),
    },
  }
}

function initGearBodyBuffers(
  gl: WebGL2RenderingContext,
): GpuState['buffers']['gearBody'] {
  const buffers: GpuState['buffers']['gearBody'] = {}

  for (const radius of GEAR_RADIUSES) {
    const buffer = gl.createBuffer()
    invariant(buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    const teeth = radius * TEETH
    const data = new Float32Array((teeth + 1) * 2 + 2)

    data[0] = 0.0
    data[1] = 0.0

    for (let i = 0; i <= teeth; i++) {
      const angle = TWO_PI * (i / teeth)
      data[i * 2 + 0] = Math.cos(angle)
      data[i * 2 + 1] = Math.sin(angle)
    }

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    buffers[radius] = {
      vertex: buffer,
      count: 1 + teeth + 1,
    }
  }

  return buffers
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

function initGearToothBuffer(
  gl: WebGL2RenderingContext,
): WebGLBuffer {
  const buffer = gl.createBuffer()
  invariant(buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      -0.5, -1.0,
      -0.5, 0.0,
      0.5, -1.0,
      0.5, 0.0,
    ]),
    gl.STATIC_DRAW,
  )
  return buffer
}

async function initTextures(
  gl: WebGL2RenderingContext,
): Promise<GpuState['textures']> {
  const gears: GpuState['textures']['gears'] = {}

  const canvas = document.createElement('canvas')

  const context = canvas.getContext('2d')
  invariant(context)

  // TODO
  const scale = 100

  for (const radius of GEAR_RADIUSES) {
    const vx = radius * 2 * scale
    const vy = radius * 2 * scale
    canvas.width = vx
    canvas.height = vy
    context.clearRect(0, 0, vx, vy)

    context.translate(vx / 2, vy / 2)

    context.fillStyle = 'blue'
    context.beginPath()
    context.arc(0, 0, radius * scale, 0, TWO_PI)
    context.fill()
    context.closePath()

    context.beginPath()
    context.lineWidth = 4
    context.strokeStyle = 'white'

    const teeth = radius * TEETH
    for (let i = 0; i < teeth; i++) {
      context.save()
      context.rotate((i / teeth) * TWO_PI)
      context.moveTo((radius - 0.25) * scale, 0)
      context.lineTo(radius * scale, 0)
      context.stroke()
      context.restore()
    }

    context.closePath()

    const image = await createImageBitmap(canvas)

    const texture = gl.createTexture()
    invariant(texture)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      vx,
      vy,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    )
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR,
    )
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR,
    )

    gears[radius] = texture
  }

  return { gears }
}
