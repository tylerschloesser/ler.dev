#version 300 es

precision mediump float;

in vec2 aVertex;
in vec4 aColor;

uniform vec2 uPosition;
uniform vec2 uViewport;

uniform mat4 uView;
uniform mat4 uProjection;

uniform float uAlpha;

out vec2 vPosition;

void main() {
  vPosition = (aVertex + vec2(1.0, 1.0)) / 2.0 * uViewport;
  gl_Position = vec4(aVertex, 0, 1);
}
