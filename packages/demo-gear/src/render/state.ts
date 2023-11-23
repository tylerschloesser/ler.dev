import invariant from 'tiny-invariant'
import { GEAR_RADIUSES, TEETH, TWO_PI } from '../const.js'
import { initMatrices } from './matrices.js'
import chainFrag from './shaders/chain.frag.glsl'
import chainVert from './shaders/chain.vert.glsl'
import gearBodyFrag from './shaders/gear-body.frag.glsl'
import gearBodyVert from './shaders/gear-body.vert.glsl'
import gearTeethFrag from './shaders/gear-teeth.frag.glsl'
import gearTeethVert from './shaders/gear-teeth.vert.glsl'
import gridFrag from './shaders/grid.frag.glsl'
import gridVert from './shaders/grid.vert.glsl'
import outlineRectFrag from './shaders/outline-rect.frag.glsl'
import outlineRectVert from './shaders/outline-rect.vert.glsl'
import { GpuState } from './types.js'
import {
  getAttribLocation,
  getUniformLocation,
  initProgram,
} from './util.js'

export async function initGpuState(
  gl: WebGL2RenderingContext,
): Promise<GpuState> {
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  return {
    programs: {
      grid: initGridProgram(gl),
      gearBody: initGearBodyProgram(gl),
      gearTeeth: initGearTeethProgram(gl),
      chain: initChainProgram(gl),
      outlineRect: initOutlineRectProgram(gl),
    },
    buffers: {
      square: initSquareBuffer(gl),
      gearBody: initGearBodyBuffers(gl),
      gearTooth: initGearToothBuffer(gl),
      outlineRect: initOutlineRectBuffer(gl),
    },
    textures: await initTextures(gl),
    matrices: initMatrices(),
  }
}

function initChainProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['chain'] {
  const program = initProgram(gl, {
    vert: chainVert,
    frag: chainFrag,
  })
  return {
    program,
    attributes: {
      vertex: getAttribLocation(gl, program, 'aVertex'),
    },
    uniforms: {
      model: getUniformLocation(gl, program, 'uModel'),
      view: getUniformLocation(gl, program, 'uView'),
      projection: getUniformLocation(
        gl,
        program,
        'uProjection',
      ),
      color: getUniformLocation(gl, program, 'uColor'),
    },
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
      model: getUniformLocation(gl, program, 'uModel'),
      view: getUniformLocation(gl, program, 'uView'),
      projection: getUniformLocation(
        gl,
        program,
        'uProjection',
      ),
      color: getUniformLocation(gl, program, 'uColor'),
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
      model: getUniformLocation(gl, program, 'uModel'),
      view: getUniformLocation(gl, program, 'uView'),
      projection: getUniformLocation(
        gl,
        program,
        'uProjection',
      ),
      color: getUniformLocation(gl, program, 'uColor'),
      tileSize: getUniformLocation(
        gl,
        program,
        'uTileSize',
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
      ),
      tileSize: getUniformLocation(
        gl,
        program,
        'uTileSize',
      ),
      camera: getUniformLocation(gl, program, 'uCamera'),
      zoom: getUniformLocation(gl, program, 'uZoom'),
    },
  }
}

function initOutlineRectProgram(
  gl: WebGL2RenderingContext,
): GpuState['programs']['outlineRect'] {
  const program = initProgram(gl, {
    vert: outlineRectVert,
    frag: outlineRectFrag,
  })
  return {
    program,
    attributes: {
      vertex: getAttribLocation(gl, program, 'aVertex'),
    },
    uniforms: {
      model: getUniformLocation(gl, program, 'uModel'),
      view: getUniformLocation(gl, program, 'uView'),
      projection: getUniformLocation(
        gl,
        program,
        'uProjection',
      ),
      color: getUniformLocation(gl, program, 'uColor'),
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

function initOutlineRectBuffer(
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
