#version 300 es

precision mediump float;

in vec2 vTexturePosition;

uniform vec4 uColor;
uniform sampler2D uSampler;

out vec4 color;

void main() {
  color = texture(uSampler, vTexturePosition);
}
