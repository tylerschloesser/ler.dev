#version 300 es

precision mediump float;

in vec2 aVertex;
in vec4 aColor;

void main() {
  gl_Position = vec4(aVertex, 0, 1);
}
