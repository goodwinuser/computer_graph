#include <cmath>
#include "lightsource.h"

# define M_PI 3.14159265358979323846

void LightSource::moveBy(const sf::Vector3f &vec) {
    position += vec;
}

LightSource LightSource::point(const sf::Vector3f &position, float intensity) {
    return {position, intensity, LightSourceType::Point, {}, 0};
}

LightSource LightSource::directed(const sf::Vector3f &position, float intensity, const sf::Vector3f &direction) {
    return {position, intensity, LightSourceType::Directed, direction, 0};
}

LightSource
LightSource::projector(const sf::Vector3f &position, float intensity, const sf::Vector3f &direction, float angle) {
    return {position, intensity, LightSourceType::Projector, direction, (float)cos(angle * M_PI / 180)};
}
