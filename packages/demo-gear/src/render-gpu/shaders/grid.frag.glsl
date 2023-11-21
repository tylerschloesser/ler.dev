#version 300 es

precision mediump float;

uniform vec2 uViewport;
uniform vec2 uCamera;
uniform float uTileSize;
uniform float uPixelRatio;

in vec2 vPosition;

out vec4 color;

void main() {
  float lineWidth = 2.0 * uPixelRatio;

  vec2 v =
    vPosition -
    uViewport / 2.0 +
    uCamera * uTileSize +
    lineWidth / 2.0;
  bool render =
    mod(v.x, uTileSize) < lineWidth ||
    mod(v.y, uTileSize) < lineWidth;

  if (render) {
    color = vec4(0.25, 0.25, 0.25, 1);
  } else {
    color = vec4(0, 0, 0, 0);
  }
}
