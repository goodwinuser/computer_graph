#include <GL/glew.h>
#include <SFML/OpenGL.hpp>
#include <SFML/Window.hpp>
#include <SFML/Graphics.hpp>
#include <cmath>
#include <iostream>
#include <chrono>
#include "object.h"
#include "camera.h"
#include "lightsource.h"

constexpr int lightsCount = 3;

LightSource lights[lightsCount];
float camWto[16];

void InitVBO() {
    for (auto [_, obj]: ObjectRepository::instance().objects()) {
        obj->createVAO();
        glBindVertexArray(obj->VAO());

        auto coord = obj->shader().attributes().at("coord");
        auto texCoord = obj->shader().attributes().at("texCoord");
        auto normal = obj->shader().attributes().at("normal");
        glEnableVertexAttribArray(coord);
        glEnableVertexAttribArray(texCoord);
        glEnableVertexAttribArray(normal);

        glBindBuffer(GL_ARRAY_BUFFER, obj->VBO());
        glBufferData(GL_ARRAY_BUFFER, obj->vertices().size() * sizeof(VertexData), obj->vertices().data(),
                     GL_STATIC_DRAW);
        glVertexAttribPointer(coord, 3, GL_FLOAT, GL_FALSE, sizeof(VertexData), 0);
        glVertexAttribPointer(normal, 3, GL_FLOAT, GL_FALSE, sizeof(VertexData), (void *) (sizeof(GLfloat) * 3));
        glVertexAttribPointer(texCoord, 2, GL_FLOAT, GL_FALSE, sizeof(VertexData),
                              (void *) (sizeof(GLfloat) * 6));

        auto transform = obj->shader().attributes().at("transformation");
        glEnableVertexAttribArray(transform);
        glEnableVertexAttribArray(transform + 1);
        glEnableVertexAttribArray(transform + 2);
        glEnableVertexAttribArray(transform + 3);

        glBindBuffer(GL_ARRAY_BUFFER, obj->matrices());
        auto info = ObjectRepository::instance().instances().at(obj);
        glBufferData(GL_ARRAY_BUFFER, info.count * 16 * sizeof(float), info.otwMatrices, GL_STREAM_DRAW);
        glVertexAttribPointer(transform, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float), 0);
        glVertexAttribPointer(transform + 1, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (4 * sizeof(float)));
        glVertexAttribPointer(transform + 2, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (8 * sizeof(float)));
        glVertexAttribPointer(transform + 3, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (12 * sizeof(float)));

        glVertexAttribDivisor(transform, 1);
        glVertexAttribDivisor(transform + 1, 1);
        glVertexAttribDivisor(transform + 2, 1);
        glVertexAttribDivisor(transform + 3, 1);

        auto inverse = obj->shader().attributes().at("inverseMat");
        glEnableVertexAttribArray(inverse);
        glEnableVertexAttribArray(inverse + 1);
        glEnableVertexAttribArray(inverse + 2);
        glEnableVertexAttribArray(inverse + 3);

        glBindBuffer(GL_ARRAY_BUFFER, obj->inverseMatrices());
        glBufferData(GL_ARRAY_BUFFER, info.count * 16 * sizeof(float), info.wtoMatrices, GL_STREAM_DRAW);
        glVertexAttribPointer(inverse, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float), 0);
        glVertexAttribPointer(inverse + 1, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (4 * sizeof(float)));
        glVertexAttribPointer(inverse + 2, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (8 * sizeof(float)));
        glVertexAttribPointer(inverse + 3, 4, GL_FLOAT, GL_FALSE, 16 * sizeof(float),(void *) (12 * sizeof(float)));

        glVertexAttribDivisor(inverse, 1);
        glVertexAttribDivisor(inverse + 1, 1);
        glVertexAttribDivisor(inverse + 2, 1);
        glVertexAttribDivisor(inverse + 3, 1);

        glBindBuffer(GL_ARRAY_BUFFER, 0);

        glEnableVertexAttribArray(0);
        glBindVertexArray(0);
    }
}

void Init() {
    InitVBO();
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
}

void fillUniforms(sf::Vector3f* positions, float* intensities, int* types, sf::Vector3f* directions, float* angles) {
    for(int i = 0; i < lightsCount; ++i) {
        positions[i] = lights[i].position;
        intensities[i] = lights[i].intensity;
        types[i] = (int)lights[i].type;
        directions[i] = lights[i].direction;
        angles[i] = lights[i].angle;
    }
}

void Draw(Camera& cam) {
    for (auto [name, obj]: ObjectRepository::instance().objects()) {
        glUseProgram(obj->shader().program());

        sf::Vector3f positions[lightsCount];
        float intensities[lightsCount];
        int types[lightsCount];
        sf::Vector3f directions[lightsCount];
        float angles[lightsCount];

        fillUniforms(positions, intensities, types, directions, angles);

        glUniform3fv(obj->shader().uniforms().at("positions"), lightsCount, (float*)positions);
        glUniform1fv(obj->shader().uniforms().at("intensities"), lightsCount, intensities);
        glUniform1iv(obj->shader().uniforms().at("types"), lightsCount, types);
        glUniform3fv(obj->shader().uniforms().at("directions"), lightsCount, (float*)directions);
        glUniform1fv(obj->shader().uniforms().at("angles"), lightsCount, angles);

        glUniform1i(obj->shader().uniforms().at("ourTexture1"), 0);
        auto camPosition = cam.getPosition();
        glUniform4f(obj->shader().uniforms().at("cameraWorldPosition"), camPosition.x, camPosition.y, camPosition.z, 1);
        glUniformMatrix4fv(obj->shader().uniforms().at("cameraTransform"), 1, GL_FALSE, camWto);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, obj->texture().getNativeHandle());

        auto count = ObjectRepository::instance().instances().at(obj).count;

        glBindBuffer(GL_ARRAY_BUFFER, obj->matrices());
        glBufferData(GL_ARRAY_BUFFER, 16 * count * sizeof(float), obj->otwMatrices(), GL_STREAM_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, obj->inverseMatrices());
        glBufferData(GL_ARRAY_BUFFER, 16 * count * sizeof(float), obj->wtoMatrices(), GL_STREAM_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, 0);

        glBindVertexArray(obj->VAO());
        glDrawArraysInstanced(GL_TRIANGLES, 0, obj->vertices().size(), count);
        glBindVertexArray(0);
    }


    glUseProgram(0);
}


int main() {
    sf::Window window(sf::VideoMode(1000, 1000), "My OpenGL window", sf::Style::Default, sf::ContextSettings(24));
    window.setVerticalSyncEnabled(true);

    window.setActive(true);
    glewInit();

    std::vector<std::string> attributes {"coord", "normal", "texCoord", "transformation", "inverseMat"};
    std::vector<std::string> uniforms {"cameraTransform", "ourTexture1", "positions", "intensities", "types", "directions", "angles", "cameraWorldPosition"};

    auto shader = Shader::load("vertex.vert", "phong.frag", attributes, uniforms);
    auto toonShader = Shader::load("vertex.vert", "toon.frag", attributes, uniforms);
    auto rimShader = Shader::load("vertex.vert", "rim.frag", attributes, uniforms);

    lights[0] = LightSource::point({0, 0, 100}, 0.8);
    //lights[1] = LightSource::directed({0, 0, -500}, 0.9, {1, 1, -1});
    //lights[2] = LightSource::projector({100, 0, 0}, 1, {-1, 0, 0}, 60);

    auto pig = Object::load("tiger.obj", "texture1.png");
    pig.setShader(toonShader);
    auto pigInstances = ObjectRepository::instance().alloc(pig.name(), 5);
    pigInstances[0].rotateAroundY(270);
    pigInstances[0].moveBy({-0.7,-0.6,0.4});
    pigInstances[1].rotateAroundY(270);
    pigInstances[1].moveBy({0,-0.6,0.4});
    pigInstances[2].rotateAroundY(270);
    pigInstances[2].moveBy({0.7,-0.6,0.4});
    pigInstances[3].rotateAroundY(270);
    pigInstances[3].moveBy({-0.35,0,0.4});
    pigInstances[4].rotateAroundY(270);
    pigInstances[4].moveBy({0.35,0,0.4});

    auto cat  = Object::load("cat.obj","cat_diff.tga");
    cat.setShader(rimShader);
    auto catInstance = ObjectRepository::instance().alloc(cat.name(),1);
    catInstance[0].rotateAroundY(180);
    catInstance[0].moveBy({0,0.8,0.4});

    auto room = Object::load("wall.obj", "texture2.png");
    room.setShader(shader);
    auto walls = 5;
    auto roomInstances = ObjectRepository::instance().alloc(room.name(), walls);
    for (int i = 0; i < walls; ++i) {
        auto &model = roomInstances[i];
        model.scale(2, 2, 2);
        model.moveBy({0, 0, -4});
    }
    roomInstances[2].rotateAroundY(90);
    roomInstances[3].rotateAroundY(270);
    roomInstances[4].rotateAroundX(90);
    roomInstances[1].rotateAroundX(270);
    //roomInstances[5].moveBy({0, 0, -4});

    float camOtw[16];
    auto camera = Camera({0, 0, -4.8}, camOtw, camWto);
    //camera.rotateAroundLine(60, Axis::X);

    Init();

    bool mousePressed = false;
    sf::Vector2i mousePrev;
    float speed = 0.1f;
    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                window.close();
            } else if (event.type == sf::Event::Resized) {
                glViewport(0, 0, event.size.width, event.size.height);
            } else if (event.type == sf::Event::KeyPressed) {
                switch (event.key.code) {
                    case (sf::Keyboard::W): {
                        auto v = normalize(camera.toWorldCoordinates({0, 0, 1}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    case (sf::Keyboard::S): {
                        auto v = normalize(camera.toWorldCoordinates({0, 0, -1}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    case (sf::Keyboard::A): {
                        auto v = normalize(camera.toWorldCoordinates({-1, 0, 0}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    case (sf::Keyboard::D): {
                        auto v = normalize(camera.toWorldCoordinates({1, 0, 0}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    case (sf::Keyboard::Q): {
                        auto v = normalize(camera.toWorldCoordinates({0, 1, 0}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    case (sf::Keyboard::E): {
                        auto v = normalize(camera.toWorldCoordinates({0, -1, 0}) - camera.getPosition());
                        v *= speed;
                        camera.moveBy(v);
                        break;
                    }
                    default:
                        break;
                }
            } else if(event.type == sf::Event::MouseButtonPressed && event.mouseButton.button == sf::Mouse::Button::Left) {
                mousePressed = true;
            } else if(event.type == sf::Event::MouseButtonReleased && event.mouseButton.button == sf::Mouse::Button::Left) {
                mousePressed = false;
            }
        }

        if(mousePressed) {
            auto diff = mousePrev - sf::Mouse::getPosition();
            if(diff.x != 0) {
                auto angle = (float)diff.x / window.getSize().x * 80;
//                auto v = normalize(camera.toWorldCoordinates({0, 0, 1}) - camera.getPosition());
//                auto x = normalize(cross(v, {1, 0, 0}));
//                camera.rotateAroundLine(x, angle);
//                camera.rotateAroundLine(normalize(camera.toObjectCoordinates(sf::Vector3f {0, 1, 0} + camera.getPosition())), -angle);
                camera.rotateAroundLine({0, 1, 0}, angle);
//                camera.rotateAroundLine(angle, Axis::Y);
//                camera.rotateAroundY(angle);
            }

            if(diff.y != 0) {
                auto angle = (float)diff.y / window.getSize().y * 80;
//                auto v = normalize(camera.toWorldCoordinates({1, 0, 0}) - camera.getPosition());
//                auto x = normalize(cross(v, normalize(camera.toWorldCoordinates({0, 1, 0}) - camera.getPosition())));
//                camera.rotateAroundLine(x, -angle);
//                camera.rotateAroundLine(normalize(camera.toObjectCoordinates(sf::Vector3f {1, 0, 0} + camera.getPosition())), -angle);
//                camera.rotateAroundLine(-angle, Axis::X);
                camera.rotateAroundLine({1, 0, 0}, -angle);
//                camera.rotateAroundX(angle);
            }
        }

        mousePrev = sf::Mouse::getPosition();

        for(int i = 0; i < pigInstances.size(); ++i) {
            auto& model = pigInstances[i];
//            model.rotateAroundY(1.0f / pow(i + 1, 2));
            //model.rotateAroundLine(1.0f / pow(2, 2), Axis::Y);
        }

//        catInstance.rotateAroundLine(1, Axis::Y);

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        Draw(camera);

        window.display();
    }

    return 0;
}