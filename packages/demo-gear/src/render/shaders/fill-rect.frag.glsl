#version 300 es

precision highp float;

uniform vec4 uColor;
uniform bool uEnableMask;

out vec4 color;

in vec2 vPosition;

void main() {

  if (uEnableMask && (vPosition.x < 0.0 || vPosition.y < 0.0 || vPosition.y > 1.0 || vPosition.x> 1.0)) {
    color = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    color = uColor;
  }
}
