#include <iostream>
#include <fstream>
#include <sstream>
#include "shader.h"

Shader::Shader(const std::string &vertex, const std::string &fragment, const std::vector<std::string> &attributes, const std::vector<std::string> &uniforms) {
    GLuint vShader = glCreateShader(GL_VERTEX_SHADER);
    auto vertex_text = vertex.c_str();
    glShaderSource(vShader, 1, &vertex_text, NULL);
    glCompileShader(vShader);

    auto fragment_text = fragment.c_str();
    GLuint fShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fShader, 1, &fragment_text, NULL);
    glCompileShader(fShader);

    _program = glCreateProgram();

    glAttachShader(_program, vShader);
    glAttachShader(_program, fShader);

    glLinkProgram(_program);
    int link_ok;
    glGetProgramiv(_program, GL_LINK_STATUS, &link_ok);
    if (!link_ok) {
        std::cout << "error attach shaders \n";
        return;
    }

    for(const auto& attribute: attributes) {
        auto attr = glGetAttribLocation(_program, attribute.c_str());
        if(attr == -1) {
            std::cout << "Error loading attribute " << attribute << std::endl;
        }

        _attributes[attribute] = attr;
    }

    for(const auto& uniform: uniforms) {
        auto attr = glGetUniformLocation(_program, uniform.c_str());
        if(attr == -1) {
            std::cout << "Error loading uniform " << uniform << std::endl;
        }

        _uniforms[uniform] = attr;
    }
}

Shader Shader::load(const std::string &vertex, const std::string &fragment, const std::vector<std::string> &attributes,
                    const std::vector<std::string> &uniforms) {
    std::ifstream v(vertex);
    if(!v) {
        std::cout << "Cannot open vertex shader" << std::endl;
        return {};
    }

    std::ifstream f(fragment);
    if(!f) {
        std::cout << "Cannot open fragment shader" << std::endl;
        return {};
    }

    std::stringstream vertex_text;
    vertex_text << v.rdbuf();

    std::stringstream fragment_text;
    fragment_text << f.rdbuf();

    return {vertex_text.str(), fragment_text.str(), attributes, uniforms};
}
