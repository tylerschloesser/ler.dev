#version 300 es

precision mediump float;

uniform mat4 uTransform;

in vec2 aVertex;
in mat4 aMatrix;

void main() {
  gl_Position = uTransform * aMatrix * vec4(aVertex, 0, 1);
}
