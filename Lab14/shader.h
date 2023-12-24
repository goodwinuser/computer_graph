#ifndef LAB1GL_SHADER_H
#define LAB1GL_SHADER_H

#include <GL/glew.h>
#include <SFML/OpenGL.hpp>
#include <map>
#include <vector>
#include <string>

class Shader {
public:
    Shader() = default;
    static Shader load(const std::string& vertex, const std::string& fragment, const std::vector<std::string>& attributes, const std::vector<std::string>& uniforms);
    const std::map<std::string, GLint>& uniforms() const { return _uniforms; }
    const std::map<std::string, GLint>& attributes() const { return _attributes; }
    const std::string& name() const { return _name; }
    GLuint program() const { return _program; }

private:
    Shader(const std::string& vertex, const std::string& fragment, const std::vector<std::string>& attributes, const std::vector<std::string>& uniforms);

private:
    GLuint _program;
    std::map<std::string, GLint> _uniforms;
    std::map<std::string, GLint> _attributes;
    std::string _name;
};


#endif //LAB1GL_SHADER_H
