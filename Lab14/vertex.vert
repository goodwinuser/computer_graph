#version 330 core

#define LIGHTS_COUNT 3
#define POINT 0
#define DIRECTED 1
#define PROJECTOR 2

in vec3 coord;
in vec3 normal;
in vec2 texCoord;
in mat4 transformation;
in mat4 inverseMat;

uniform mat4 cameraTransform;
uniform vec4 cameraWorldPosition;
uniform vec3 positions[LIGHTS_COUNT];
uniform vec3 directions[LIGHTS_COUNT];
uniform int types[LIGHTS_COUNT];

out vec2 vTextureCoordinate;
out vec3 lightVectors[LIGHTS_COUNT];
out float lightTypes[LIGHTS_COUNT];
out vec3 lightDirections[LIGHTS_COUNT];
out vec3 normalVector;
out vec3 camVector;

void main() {
    vec3 position = vec3(coord);
    float far = 100.0;
    float near = 0.01;
    float fov = 1.22173;
    mat4 projection = mat4(
        1 / tan(fov / 2), 0, 0, 0,
        0, 1 / tan(fov / 2), 0, 0,
        0, 0, (far + near) / (far - near), 1,
        0, 0, -(2 * far * near) / (far - near), 0
    );


    vec4 transformed = transformation * vec4(position.xyz, 1.0);
    for(int i = 0; i < LIGHTS_COUNT; ++i) {
        lightTypes[i] = types[i];
        if(types[i] == POINT || types[i] == PROJECTOR){
            vec4 lightPos = vec4(positions[i], 1.0);
            lightVectors[i] = vec3(normalize((lightPos - transformed).xyz));
            lightDirections[i] = -directions[i];
        } else if(types[i] == DIRECTED) {
            lightVectors[i] = normalize(directions[i]);
        }
    }
    vec4 pos = projection * (cameraTransform * vec4(transformed.xyz, 1.0));
    gl_Position = pos;

    camVector = normalize(vec3(cameraWorldPosition - transformed).xyz);
    mat4 normalMatrix = transpose(inverseMat);
    normalVector = normalize(vec3((normalMatrix * vec4(normal, 1.0)).xyz));

    vTextureCoordinate = texCoord;
}