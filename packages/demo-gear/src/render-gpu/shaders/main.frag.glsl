#version 300 es

precision mediump float;

uniform vec2 uViewport;
uniform vec2 uCamera;
uniform float uTileSize;

in vec2 vPosition;

out vec4 color;

void main() {

  float lineWidth = 2.0;

  bool render = mod(vPosition.x + (uCamera.x * uTileSize), uTileSize) < lineWidth;

  if (render) {
    color = vec4(1, 1, 1, 1);
  } else {
    color = vec4(0,0,0,0);
  }
}
