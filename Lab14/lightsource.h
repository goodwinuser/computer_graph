#ifndef LAB1GL_LIGHTSOURCE_H
#define LAB1GL_LIGHTSOURCE_H

#include "transform.h"

enum class LightSourceType: int {
    Point = 0,
    Directed = 1,
    Projector = 2
};

struct LightSource {
    static LightSource point(const sf::Vector3f& position, float intensity);
    static LightSource directed(const sf::Vector3f& position, float intensity, const sf::Vector3f& direction);
    static LightSource projector(const sf::Vector3f& position, float intensity, const sf::Vector3f& direction, float angle);

    void moveBy(const sf::Vector3f& vec);

    sf::Vector3f position;
    float intensity;
    LightSourceType type;
    sf::Vector3f direction;
    float angle;
};


#endif //LAB1GL_LIGHTSOURCE_H
