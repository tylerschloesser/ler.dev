#version 300 es

precision mediump float;

in vec2 aVertex;

uniform vec2 uPosition;
uniform vec2 uViewport;

out vec2 vPosition;

void main() {
  vPosition = (aVertex + 1.0) / 2.0;
  // flip the y axis so it matches canvas/dom
  vPosition = vec2(vPosition.x, 1.0 - vPosition.y);
  vPosition *= uViewport;
  gl_Position = vec4(aVertex, 0, 1);
}