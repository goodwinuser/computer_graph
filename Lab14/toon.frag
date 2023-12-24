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
    vec3 n = normalize(normalVector);
    vec4 texColor = texture(ourTexture1, vTextureCoordinate);
    vec3 v = normalize(camVector);

    for(int i = 0; i < LIGHTS_COUNT; ++i) {
        vec3 l = normalize(lightVectors[i]);
        vec3 d = normalize(lightDirections[i]);
        float diff = 0;
        if(ceil(lightTypes[i]) != PROJECTOR || dot(l, d) > angles[i]) {
            diff = max(dot(n, l), 0);
        }


        if (diff < 0.4) {
            color += texColor * 0.3 * intensities[i];
        } else if ( diff < 0.7 ){
            color += texColor * intensities[i];
        } else {
            color += texColor * 1.3 * intensities[i];
        }
    }

    const float rimPower = 8.0;
    const float bias = 0.2;
    float rim = pow(1.0 + bias - max(dot(n, v), 0.0), rimPower);

    if(rim > 0.90) {
        color = vec4(0, 0, 0, 1);
    }
}