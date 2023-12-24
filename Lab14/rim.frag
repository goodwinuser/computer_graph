#version 330 core

#define LIGHTS_COUNT 3
#define POINT 0
#define DIRECTED 1
#define PROJECTOR 2

in vec2 vTextureCoordinate;
in vec3 lightVectors[LIGHTS_COUNT];
in float lightTypes[LIGHTS_COUNT];
in vec3 lightDirections[LIGHTS_COUNT];
in vec3 normalVector;
in vec3 camVector;

uniform sampler2D ourTexture1;
uniform float intensities[LIGHTS_COUNT];
uniform float angles[LIGHTS_COUNT];

out vec4 color;

void main() {
    const float specPower = 30.0;
    const float rimPower = 8.0;
    const float bias = 0.3;

    vec3 n = normalize(normalVector);
    vec3 v = normalize(camVector);
    vec4 texColor = texture(ourTexture1, vTextureCoordinate);
    float intensity = 0;
    for(int i = 0; i < LIGHTS_COUNT; ++i) {
        vec3 l = normalize(lightVectors[i]);
        vec3 d = normalize(lightDirections[i]);
        if(ceil(lightTypes[i]) == PROJECTOR && dot(l, d) < angles[i]) {
            continue;
        }

        intensity += max(dot(n, l), 0.0) * intensities[i];
    }

    intensity = min(intensity, 1);
    vec4 diff = texColor * intensity;
    float rim = pow(1.0 + bias - max(dot(n, v), 0.0), rimPower);

    color = diff + rim * vec4(0.3, 0, 0.1, 1.0);
}