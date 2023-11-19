#include <iostream>
#include <gl/glew.h>
#include <SFML/OpenGL.hpp>
#include <SFML/Window.hpp>
#include <SFML/Graphics.hpp>

#define _USE_MATH_DEFINES // for C++
#include <cmath>
#include <math.h>

int Program_Type;
int Share;

// ID шейдерной программы
GLuint Program;
// ID атрибута
GLint Attrib_vertex;
// ID цветового атрибута
GLint Color_Attrib_vertex;
// ID Vertex Buffer Object
GLuint VBO;
// ID Color Vertex Buffer Object
GLuint CVBO;
// ID uniform
GLint gScaleLocation;

struct Vertex {
	GLfloat x;
	GLfloat y;
};

struct Color {
	GLfloat r;
	GLfloat g;
	GLfloat b;
	GLfloat a;
};

// Исходный код вершинного шейдера
const char* ConstVertexShaderSource = R"(
	#version 330 core

	in vec2 coord;

	void main() {
		gl_Position = vec4(coord, 0.0, 1.0);
	}
)";

// Исходный код фрагментного шейдера
const char* ConstFragShaderSource = R"(
	#version 330 core

	out vec4 color;

	void main() {
		color = vec4(0.5, 0.5, 1, 1);
	}
)";

// передача цвета
// Исходный код вершинного шейдера
const char* UVertexShaderSource = R"(
	#version 330 core
	in vec2 coord;
	void main() {
		gl_Position = vec4(coord, 0.0, 1.0);
	}
)";

// Исходный код фрагментного шейдера
const char* UFragShaderSource = R"(
	#version 330 core

	uniform vec4 color; 

	void main() {
		gl_FragColor = color; 

	}
)";



//Градиент
// Исходный код вершинного шейдера
const char* GrVertexShaderSource = R"(
	#version 330 core

	in vec3 position;
	in vec4 color;
	out vec4 vertexColor; // Передаем цвет во фрагментный шейдер

	void main() {
		// Напрямую передаем vec3 в vec4
		gl_Position = vec4(position, 1.0);
		// Устанавливаем значение выходной переменной равным атрибуту цвета
		vertexColor = color;
	}
)";

// Исходный код фрагментного шейдера
const char* GrFragShaderSource = R"(
	#version 330 core

	in vec4 vertexColor;
	// Входная переменная из вершинного шейдера (то же название и тот же тип)
	out vec4 color;

	void main() {
		color = vertexColor;
	}
)";


//void SetIcon(sf::Window& wnd);
void Init();
void Draw();

// Освобождение буфера
void ReleaseVBO() {
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glDeleteBuffers(1, &VBO);
}

// Освобождение шейдеров
void ReleaseShader() {
	// Передавая ноль, мы отключаем шейдерную программу
	glUseProgram(0);
	// Удаляем шейдерную программу
	glDeleteProgram(Program);
}

void Release() {
	// Шейдеры
	ReleaseShader();
	// Вершинный буфер
	ReleaseVBO();
}

int main() {
	// 1 - четырехугольник, 2 - пятиугольник, 3 - веер
	Share = 3;

	// 1 - цвет константа, 2 - передача цвета uniform, 3 - градиент
	Program_Type = 3;


	sf::Window window(sf::VideoMode(600, 600), "My OpenGL window",
		sf::Style::Default, sf::ContextSettings(24));
	window.setVerticalSyncEnabled(true);
	window.setActive(true);
	glewInit();
	Init();
	while (window.isOpen()) {
		sf::Event event;
		while (window.pollEvent(event)) {
			if (event.type == sf::Event::Closed) { window.close(); }
			else if (event.type == sf::Event::Resized) {
				glViewport(0, 0, event.size.width,
					event.size.height);
			}
		}
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		Draw();
		window.display();
	}
	Release();

	return 0;
}

void checkOpenGLerror()
{
	GLenum err;
	while ((err = glGetError()) != GL_NO_ERROR)
	{
		// Process/log the error.
		std::cout << err << std::endl;
	}
}
void ShaderLog(unsigned int shader)
{
	int infologLen = 0;
	glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infologLen);
	if (infologLen > 1)
	{
		int charsWritten = 0;
		std::vector<char> infoLog(infologLen);
		glGetShaderInfoLog(shader, infologLen, &charsWritten, infoLog.data());
		std::cout << "InfoLog: " << infoLog.data() << std::endl;
	}
}

void InitShader() {
	// Создаем вершинный шейдер
	GLuint vShader = glCreateShader(GL_VERTEX_SHADER);
	// Передаем исходный код
	if (Program_Type == 1) {
		glShaderSource(vShader, 1, &ConstVertexShaderSource, NULL);
	} else if (Program_Type == 2) {
		glShaderSource(vShader, 1, &UVertexShaderSource, NULL);
	} else if (Program_Type == 3) {
		glShaderSource(vShader, 1, &GrVertexShaderSource, NULL); //градиент
	}

	// Компилируем шейдер
	glCompileShader(vShader);
	std::cout << "vertex shader \n";
	// Функция печати лога шейдера
	ShaderLog(vShader);

	// Создаем фрагментный шейдер
	GLuint fShader = glCreateShader(GL_FRAGMENT_SHADER);
	// Передаем исходный код
	if (Program_Type == 1) {
		glShaderSource(fShader, 1, &ConstFragShaderSource, NULL);
	}
	else if (Program_Type == 2) {
		glShaderSource(fShader, 1, &UFragShaderSource, NULL);
	}
	else if (Program_Type == 3) {
		glShaderSource(fShader, 1, &GrFragShaderSource, NULL); //градиент
	}

	// Компилируем шейдер
	glCompileShader(fShader);
	std::cout << "fragment shader \n";
	// Функция печати лога шейдера
	ShaderLog(fShader);

	// Создаем программу и прикрепляем шейдеры к ней
	Program = glCreateProgram();
	glAttachShader(Program, vShader);
	glAttachShader(Program, fShader);
	// Линкуем шейдерную программу
	glLinkProgram(Program);
	// Проверяем статус сборки
	int link_ok;
	glGetProgramiv(Program, GL_LINK_STATUS, &link_ok);
	if (!link_ok) {
		std::cout << "error attach shaders \n";
		return;
	}
	// Вытягиваем ID атрибута из собранной программы
	if (Program_Type == 2) {
		const char* attr_name = "coord"; //имя в шейдере
		Attrib_vertex = glGetAttribLocation(Program, attr_name);
		if (Attrib_vertex == -1) {
			std::cout << "could not bind attrib " << attr_name << std::endl;
			return;
		}
	}
	
	if (Program_Type == 3) {
		const char* attr_name = "position"; //градиент
		Attrib_vertex = glGetAttribLocation(Program, attr_name);
		if (Attrib_vertex == -1) {
			std::cout << "could not bind attrib " << attr_name << std::endl;
			return;
		}
		//дополнительный атрибут для цвета вершин при градиенте
		const char* color_attr_name = "color";
		Color_Attrib_vertex = glGetAttribLocation(Program, color_attr_name);
		if (Attrib_vertex == -1) {
			std::cout << "could not bind attrib " << color_attr_name << std::endl;
			return;
		}
	}

	checkOpenGLerror();
}

void InitVBO() {
	glGenBuffers(1, &VBO);
	glGenBuffers(2, &CVBO);
	// Вершины четырёхугольника
	Vertex quad[4] = {
	{ -0.5f, -0.5f },
	{ -0.5f, 0.5f },
	{ 0.5f, 0.5f },
	{ 0.5f, -0.5f }
	};
	// цвета вершин четыреугольника
	Color color_quad[4] = {
	{ 1.0f, 0.0f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 0.0f, 1.0f},
	{ 0.0f, 0.0f, 1.0f, 1.0f},
	{ 1.0f, 0.0f, 0.0f, 1.0f}
	};

	// Вершины правильного пятиугольника
	float R = 1.0;
	float pi = 3.14159265358979323846;
	float phi = pi * 2 / 5;
	Vertex pentagon[5] = {
		{R * cos(phi + 2.0f * pi * 1.0f / 5.0f), R * sin(phi + 2.0f * pi * 1.0f / 5.0f)},
		{R * cos(phi + 2.0f * pi * 2.0f / 5.0f), R * sin(phi + 2.0f * pi * 2.0f / 5.0f)},
		{R * cos(phi + 2.0f * pi * 3.0f / 5.0f), R * sin(phi + 2.0f * pi * 3.0f / 5.0f)},
		{R * cos(phi + 2.0f * pi * 4.0f / 5.0f), R * sin(phi + 2.0f * pi * 4.0f / 5.0f)},
		{R * cos(phi + 2.0f * pi * 5.0f / 5.0f), R * sin(phi + 2.0f * pi * 5.0f / 5.0f)}
	};
	// цвета вершин пятиугольника
	Color color_pentagon[5] = {
	{ 1.0f, 0.0f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 0.0f, 1.0f},
	{ 0.0f, 0.0f, 1.0f, 1.0f},
	{ 1.0f, 1.0f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 1.0f, 1.0f}
	};

	// Вершины веера
	phi = pi * 2 / 27;
	Vertex fan[9] = {
		//{0.0f, 0.0f},
		{R * cos(phi + 2.0f * pi * 19.5f / 27.0f),	R * sin(phi + 2.0f * pi * 19.5f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 26.0f / 27.0f),	R * sin(phi + 2.0f * pi * 26.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 1.0f / 27.0f),	R * sin(phi + 2.0f * pi * 1.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 3.0f / 27.0f),	R * sin(phi + 2.0f * pi * 3.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 5.0f / 27.0f),	R * sin(phi + 2.0f * pi * 5.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 7.0f / 27.0f),	R * sin(phi + 2.0f * pi * 7.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 9.0f / 27.0f),	R * sin(phi + 2.0f * pi * 9.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 11.0f / 27.0f),	R * sin(phi + 2.0f * pi * 11.0f / 27.0f)},
		{R * cos(phi + 2.0f * pi * 13.0f / 27.0f),	R * sin(phi + 2.0f * pi * 13.0f / 27.0f)},
	};
	// цвета вершин веера
	Color color_fan[9] = {
	{ 1.0f, 0.0f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 0.0f, 1.0f},
	{ 0.0f, 0.0f, 1.0f, 1.0f},
	{ 1.0f, 1.0f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 1.0f, 1.0f},
	{ 1.0f, 0.0f, 1.0f, 1.0f},
	{ 1.0f, 0.5f, 0.0f, 1.0f},
	{ 0.0f, 1.0f, 0.5f, 1.0f},
	{ 0.0f, 0.5f, 1.0f, 1.0f}
	};

	// Передаем вершины в буфер
	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	
	if (Share == 1) {
		glBufferData(GL_ARRAY_BUFFER, sizeof(quad), quad, GL_STATIC_DRAW); // четырёхугольник
	}
	else if (Share == 2) {
		glBufferData(GL_ARRAY_BUFFER, sizeof(pentagon), pentagon, GL_STATIC_DRAW); // правильный пятиугольник
	}
	else if (Share == 3) {
		glBufferData(GL_ARRAY_BUFFER, sizeof(fan), fan, GL_STATIC_DRAW); // веер
	}

	if (Program_Type == 3) {
		// Передаем цвет в буфер
		glBindBuffer(GL_ARRAY_BUFFER, CVBO);

		if (Share == 1) {
			glBufferData(GL_ARRAY_BUFFER, sizeof(color_quad), color_quad, GL_STATIC_DRAW); // четырёхугольник
		}
		else if (Share == 2) {
			glBufferData(GL_ARRAY_BUFFER, sizeof(color_pentagon), color_pentagon, GL_STATIC_DRAW); // правильный пятиугольник
		}
		else if (Share == 3) {
			glBufferData(GL_ARRAY_BUFFER, sizeof(color_fan), color_fan, GL_STATIC_DRAW); // веер
		}
	}

	

	checkOpenGLerror(); // Проверка ошибок OpenGL, если есть то вывод в консоль тип ошибки
}

void Draw() {
	glUseProgram(Program); // Устанавливаем шейдерную программу текущей
	glEnableVertexAttribArray(Attrib_vertex); // Включаем массив атрибутов
	glBindBuffer(GL_ARRAY_BUFFER, VBO); // Подключаем VBO
	glVertexAttribPointer(Attrib_vertex, 2, GL_FLOAT, GL_FALSE, 0, 0); // Указывая pointer 0 при подключенном буфере, мы указываем что данные в VBO
	glBindBuffer(GL_ARRAY_BUFFER, 0); // Отключаем VBO
									  
	if (Program_Type == 3) {
		glEnableVertexAttribArray(Color_Attrib_vertex);
		glBindBuffer(GL_ARRAY_BUFFER, CVBO); // Подключаем CVBO
		glVertexAttribPointer(Color_Attrib_vertex, 4, GL_FLOAT, GL_FALSE, 0, 0); // Указывая pointer 0 при подключенном буфере, мы указываем что данные в VBO
		glBindBuffer(GL_ARRAY_BUFFER, 0); // Отключаем CVBO
	}

	if (Program_Type == 2) {
		float Color[4] = { 0.6f, 0.3f, 0.2f, 0.0f };
		gScaleLocation = glGetUniformLocation(Program, "color");
		glUniform4f(gScaleLocation, Color[0], Color[1], Color[2], Color[3]);
	}

	if (Share == 1) {
		glDrawArrays(GL_QUADS, 0, 4); // четырёхугольник
	}
	else if (Share == 2) {
		glDrawArrays(GL_POLYGON, 0, 5); // правильный пятиугольник
	}
	else if (Share == 3) {
		glDrawArrays(GL_TRIANGLE_FAN, 0, 9); // веер
	}

	glDisableVertexAttribArray(Attrib_vertex); // Отключаем массив атрибутов
	if (Program_Type == 3) {
		glDisableVertexAttribArray(Color_Attrib_vertex); // Отключаем массив атрибутов
	}
	glUseProgram(0); // Отключаем шейдерную программу
	checkOpenGLerror();
}

// В момент инициализации разумно произвести загрузку текстур, моделей и других вещей
void Init() {
	// Шейдеры
	InitShader();
	//Вершинный буфер
	InitVBO();
}