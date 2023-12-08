#version 300 es

precision mediump float;

in vec2 aVertex;
in mat4 aModel;

uniform mat4 uView;
uniform mat4 uProjection;

void main() {
  mat4 mvp = uProjection * uView * aModel;
  gl_Position = mvp * vec4(aVertex, 0, 1);
}
