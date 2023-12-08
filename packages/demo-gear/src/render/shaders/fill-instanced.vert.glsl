#version 300 es

precision mediump float;

in vec2 aVertex;
in mat4 aMatrix;

void main() {
  // gl_Position = aMatrix * vec4(aVertex, 0, 1);
  // if (aMatrix[0][0] == 1.234234) {
    gl_Position = aMatrix * vec4(aVertex, 0, 1);
  // } else {
  //   gl_Position = vec4(aVertex, 0, 1);
  // }
}
