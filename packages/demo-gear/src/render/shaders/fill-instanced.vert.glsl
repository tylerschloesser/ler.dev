#version 300 es

precision mediump float;

in vec2 aVertex;
in mat4 aMatrix;

void main() {
  gl_Position = aMatrix * vec4(aVertex, 0, 1);
}
