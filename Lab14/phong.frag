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
    float diffIntensity = 0;
    float specIntensity = 0;
    float specPower = 30.0;

    vec3 n = normalize(normalVector);
    vec3 v = normalize(camVector);
    vec3 r = reflect(-v, n);

    for(int i = 0; i < LIGHTS_COUNT; ++i) {
        vec3 l = normalize(lightVectors[i]);
        vec3 d = normalize(lightDirections[i]);
        if(ceil(lightTypes[i]) == PROJECTOR && dot(l, d) < angles[i]) {
            continue;
        }

        diffIntensity += max(dot(l, n), 0.0) * intensities[i];
        specIntensity += pow(max(dot(l, r), 0.0), specPower) * intensities[i];
    }

    diffIntensity = min(1, diffIntensity);
    specIntensity = min(1, specIntensity);
    vec4 texColor = texture(ourTexture1, vTextureCoordinate);
    color = texColor * diffIntensity + texColor * specIntensity;
}