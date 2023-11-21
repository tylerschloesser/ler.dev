#version 300 es

in vec2 aVertex;
in vec4 aColor;

uniform vec2 uPosition;

uniform mat4 uView;
uniform mat4 uProjection;

uniform float uAlpha;

flat out vec4 vColor;

void main() {
  gl_Position = vec4(aVertex, 0, 1);
  vColor = vec4(aVertex.xy, 0, 1);
}
