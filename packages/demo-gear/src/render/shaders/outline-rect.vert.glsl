#version 300 es

precision mediump float;

in vec2 aVertex;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uSize;

void main() {
  mat4 test = mat4(1.0);
  if (gl_VertexID % 2 == 1) {
    vec2 d;

    int i = (gl_VertexID - 1) / 2;
    if (i == 0) {
      d = vec2(1.0, 1.0);
    } else if (i == 1) {
      d = vec2(-1.0, 1.0);
    } else if (i == 2) {
      d = vec2(-1.0, -1.0);
    } else if (i == 3) {
      d = vec2(1.0, -1.0);
    } else if (i == 4) {
      d = vec2(1.0, 1.0);
    }

    // TODO scale with zoom
    test[3] = vec4(d * uSize, 0.0, 1.0);
  }

  mat4 mvp = uProjection * uView * test * uModel;

  gl_Position = mvp * vec4(aVertex, 0, 1);
}
