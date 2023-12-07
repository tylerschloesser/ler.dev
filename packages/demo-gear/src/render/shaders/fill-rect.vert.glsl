#version 300 es

precision highp float;

in vec2 aVertex;

uniform mat4 uSubModel;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec2 vPosition;

void main() {
  mat4 mvp = uProjection * uView * uModel * uSubModel;
  gl_Position = mvp * vec4(aVertex, 0, 1);

  vPosition = (uSubModel * vec4(aVertex, 0.0, 1.0)).xy;
}
