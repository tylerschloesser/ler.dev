#version 300 es

precision mediump float;

uniform vec2 uViewport;

in vec2 vPosition;

out vec4 color;

void main() {

  if (vPosition.x < uViewport.x / 2.0) {
    color = vec4(1, 0, 0, 1);
  } else {
    color = vec4(0,0,0,0);
  }
}
