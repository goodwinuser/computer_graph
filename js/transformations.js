const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var mode = "radio1";
const radioButtons = document.querySelectorAll('input[name="type"]');
for (const radioButton of radioButtons) {
    radioButton.addEventListener('change', changeSelected);
}

function changeSelected(e) {
    if (temp.length > 2) {
        polygons.push(JSON.parse(JSON.stringify(temp)));
    }
    temp = [];
    refreshCanvas();
    if (this.checked) {
        mode = this.value;
    }
}

var button4 = document.getElementById('button4');
var button5 = document.getElementById('button5');

var checkBox = document.getElementById('u_point');

// Переменные для хранения начальных и конечных координат линии
let startX, startY, endX, endY;
var polygons = []//[[[100, 100], [200, 100], [200, 200]]]
var points = []//[[300, 300], [350, 350], [400, 400]]
var temp = [], temp_line = [];
var old_polygons = [], old_points = [];

refreshCanvas();

// Функция для отрисовки линии
function drawLine(event) {
    // Проверяем, нажата ли клавиша мыши
    if (event.buttons !== 1) {
        return;
    }

    // Получаем текущие координаты мыши
    const rect = canvas.getBoundingClientRect();
    endX = event.clientX - rect.left;
    endY = event.clientY - rect.top;

    refreshCanvas();

    for (var i = 0; i < polygons.length; ++i) {
        for (var j = 0; j < polygons[i].length; ++j) {
            if ((endX - startX) * (polygons[i][j][1] - startY) - (polygons[i][j][0] - startX) * (endY - startY) > 0) {
                ctx.fillStyle = "blue";
            }
            else {
                ctx.fillStyle = "red";
            }
            ctx.fillRect(polygons[i][j][0] - 2, polygons[i][j][1] - 2, 5, 5);
        }
    }

    for (var i = 0; i < points.length; ++i) {
        if ((endX - startX) * (points[i][1] - startY) - (points[i][0] - startX) * (endY - startY) > 0) {
            ctx.fillStyle = "blue";
        }
        else {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(points[i][0] - 2, points[i][1] - 2, 5, 5);
    }

    // Рисуем линию
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function findCenter(polygon) {
    // console.log(polygon);
    // console.log(polygon.length);
    let cx = 0, cy = 0;
    for (var i = 0; i < polygon.length; ++i) {
        cx += polygon[i][0];
        cy += polygon[i][1];
    }
    //console.log("cx = " + cx / polygon.length, "cy = " + cy / polygon.length);
    return [cx / polygon.length, cy / polygon.length];
}

var flag = 2;
// Обработчик события нажатия кнопки мыши
canvas.addEventListener('mousedown', function (event) {
    console.log(mode);
    const rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;


    switch (mode) {
        case "radio1":
            refreshCanvas();
            temp.push([event.offsetX, event.offsetY]);
            ctx.moveTo(temp[0][0], temp[0][1]);
            ctx.fillRect(temp[0][0] - 2, temp[0][1] - 2, 5, 5);
            if (temp.length > 1) {
                for (var i = 1; i < temp.length; ++i) {
                    ctx.fillRect(temp[i][0] - 2, temp[i][1] - 2, 5, 5);
                    ctx.lineTo(temp[i][0], temp[i][1]);
                }
                if (temp.length > 2) {
                    ctx.closePath();
                }
                ctx.stroke();
            }
            break;
        case "radio2":
            ctx.fillRect(event.offsetX - 2, event.offsetY - 2, 5, 5);
            points.push([event.offsetX, event.offsetY]);
            break;
        case "radio3":
            old_polygons = JSON.parse(JSON.stringify(polygons));
            old_points = JSON.parse(JSON.stringify(points));
            canvas.addEventListener('mousemove', shiftPolygons);
            break;
        case "radio4":
            old_polygons = JSON.parse(JSON.stringify(polygons));
            old_points = JSON.parse(JSON.stringify(points));
            canvas.addEventListener('mousemove', rotatePolygons);
            break;
        case "radio5":
            old_polygons = JSON.parse(JSON.stringify(polygons));
            old_points = JSON.parse(JSON.stringify(points));
            canvas.addEventListener('mousemove', scalePolygons);
            break;
        case "radio6":
            determineAffiliation(event);
            canvas.addEventListener('mousemove', determineAffiliation);
            break;
        case "radio7":
            if (temp_line.length == 4) {
                refreshCanvas();
                temp_line = [];
            }
            temp_line.push([event.offsetX, event.offsetY]);
            ctx.fillRect(event.offsetX - 2, event.offsetY - 2, 5, 5);
            if (temp_line.length == 4) {
                ctx.strokeStyle = "purple";
                ctx.moveTo(temp_line[0][0], temp_line[0][1]);
                ctx.lineTo(temp_line[1][0], temp_line[1][1]);
                ctx.moveTo(temp_line[2][0], temp_line[2][1]);
                ctx.lineTo(temp_line[3][0], temp_line[3][1]);
                ctx.stroke();
                if (find_intersection(temp_line) !== null) {
                    const [x, y] = find_intersection(temp_line);
                    ctx.fillRect(x - 2, y - 2, 5, 5);
                }
            }
            break;
        case "radio8":
            canvas.addEventListener('mousemove', drawLine);
            break;
    }
});

// Обработчик события отпускания кнопки мыши
canvas.addEventListener('mouseup', function () {
    // Удаляем обработчик события движения мыши
    canvas.removeEventListener('mousemove', drawLine);
    canvas.removeEventListener('mousemove', shiftPolygons);
    canvas.removeEventListener('mousemove', rotatePolygons);
    canvas.removeEventListener('mousemove', scalePolygons);
    canvas.removeEventListener('mousemove', determineAffiliation);
});

function refreshCanvas() {
    console.log("Refresh");
    //console.log("polygons", polygons);
    //console.log("points", points);
    //console.log("temp", temp);
    ctx.strokeStyle = "red";
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < polygons.length; ++i) {
        const center = findCenter(polygons[i]);
        ctx.fillStyle = "orange";
        ctx.fillRect(center[0] - 1, center[1] - 1, 3, 3);
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(polygons[i][0][0], polygons[i][0][1])
        //console.log(polygons[i][0][0], polygons[i][0][1]);
        ctx.fillRect(polygons[i][0][0] - 2, polygons[i][0][1] - 2, 5, 5);
        for (var j = 1; j < polygons[i].length; ++j) {
            ctx.fillRect(polygons[i][j][0] - 2, polygons[i][j][1] - 2, 5, 5);
            //console.log(polygons[i][j][0], polygons[i][j][1]);
            ctx.lineTo(polygons[i][j][0], polygons[i][j][1]);
        }
        ctx.closePath();
        ctx.stroke();
    }
    for (var i = 0; i < points.length; ++i) {
        if (checkBox.checked && i === points.length - 1) {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(points[i][0] - 2, points[i][1] - 2, 5, 5);
        ctx.fillStyle = "black";
    }
    flag = 0;
}

button4.onclick = function () {
    if (temp.length > 2) {
        polygons.push(JSON.parse(JSON.stringify(temp)));
    }
    temp.length = 0;
    refreshCanvas();
}

button5.onclick = function () {
    //console.log(polygons, points, temp);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    polygons.length = 0;
    points.length = 0;
    temp.length = 0;
    //console.log(polygons, points, temp);
}

function transformMatrix(a, b, c, d, e, f) {
    return [[a, b, 0], [c, d, 0], [e, f, 1]];
}

function newCoordinates(v, matrix) {
    let result = [];
    for (var i = 0; i < v.length; ++i) {
        let temp = 0;
        for (var j = 0; j < v.length; ++j) {
            temp += (v[j] * matrix[j][i]);
        }
        result.push(temp);
        //console.log("temp = " + temp);
    }
    return result;
}

function shiftPolygons(event) {
    if (event.buttons !== 1) {
        return;
    }
    var matrix = transformMatrix(1, 0, 0, 1, event.offsetX - startX, event.offsetY - startY);
    console.log(matrix);
    for (var i = 0; i < old_polygons.length; ++i) {
        for (var j = 0; j < old_polygons[i].length; ++j) {
            const [nx, ny, nz] = newCoordinates([old_polygons[i][j][0], old_polygons[i][j][1], 1], matrix);
            polygons[i][j][0] = nx;
            polygons[i][j][1] = ny;
        }
    }
    // for (var i = 0; i < points.length; ++i) {
    //     const [nx, ny, nz] = newCoordinates([old_points[i][0], old_points[i][1], 1], matrix);
    //     points[i][0] = nx;
    //     points[i][1] = ny;
    // }
    refreshCanvas();
}

function rotatePolygons(event) {
    if (event.buttons !== 1) {
        return;
    }
    for (var i = 0; i < old_polygons.length; ++i) {
        var center = findCenter(old_polygons[i]);
        if (checkBox.checked) {
            console.log(points[points.length - 1]);
            center = [points[points.length - 1][0], points[points.length - 1][1]];
        }
        //console.log("cente-r = " + center);
        // const cosF = ((event.offsetX - center[0]) * (startX - center[0]) + (event.offsetY - center[1]) * (startY - center[1])) /
        //     (Math.abs(Math.sqrt(Math.pow(event.offsetX - center[0], 2) + Math.pow(event.offsetY - center[1], 2))) *
        //         Math.abs(Math.sqrt(Math.pow(startX - center[0], 2) + Math.pow(startY - center[1], 2))));
        var sinF = -((event.offsetX - center[0]) * (startY - center[1]) - (startX - center[0]) * (event.offsetY - center[1])) /
            (Math.abs(Math.sqrt(Math.pow(event.offsetX - center[0], 2) + Math.pow(event.offsetY - center[1], 2))) *
                Math.abs(Math.sqrt(Math.pow(startX - center[0], 2) + Math.pow(startY - center[1], 2))));
        const cosF = Math.sqrt(1 - Math.pow(sinF, 2));
        console.log("cosF = " + cosF, "sinF = " + sinF);
        console.log("F = " + Math.acos(cosF) * 180 / Math.PI, "F = " + Math.asin(sinF) * 180 / Math.PI);
        var matrix = transformMatrix(cosF, sinF, -sinF, cosF,
            -center[0] * cosF + center[1] * sinF + center[0], -center[0] * sinF - center[1] * cosF + center[1]);

        for (var j = 0; j < old_polygons[i].length; ++j) {
            const [nx, ny, nz] = newCoordinates([old_polygons[i][j][0], old_polygons[i][j][1], 1], matrix);
            polygons[i][j][0] = nx;
            polygons[i][j][1] = ny;
        }
    }

    refreshCanvas();
}

function scalePolygons(event) {
    if (event.buttons !== 1) {
        return;
    }
    for (var i = 0; i < old_polygons.length; ++i) {
        var center = findCenter(old_polygons[i]);
        if (checkBox.checked) {
            console.log(points[points.length - 1]);
            center = [points[points.length - 1][0], points[points.length - 1][1]];
        }
        const a = 1 + (event.offsetX - startX) / 100, b = 1 + (event.offsetY - startY) / 100;
        var matrix = transformMatrix(a, 0, 0, b,
            (1 - a) * center[0], (1 - b) * center[1]);

        for (var j = 0; j < old_polygons[i].length; ++j) {
            const [nx, ny, nz] = newCoordinates([old_polygons[i][j][0], old_polygons[i][j][1], 1], matrix);
            polygons[i][j][0] = nx;
            polygons[i][j][1] = ny;
        }
    }

    refreshCanvas();
}

function find_intersection(lines) {
    console.log(lines);
    const x1 = lines[0][0];
    const y1 = lines[0][1];
    const x2 = lines[1][0];
    const y2 = lines[1][1];
    const x3 = lines[2][0];
    const y3 = lines[2][1];
    const x4 = lines[3][0];
    const y4 = lines[3][1];

    const a1 = y2 - y1;
    const b1 = x1 - x2;
    const c1 = a1 * x1 + b1 * y1;

    const a2 = y4 - y3;
    const b2 = x3 - x4;
    const c2 = a2 * x3 + b2 * y3;

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
        return null;
    } else {
        const x = (b2 * c1 - b1 * c2) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;

        if (isPointOnSegment(x, y, x1, y1, x2, y2) && isPointOnSegment(x, y, x3, y3, x4, y4)) {
            return [x, y];
        } else {
            return null;
        }
    }
}

function isPointOnSegment(x, y, x1, y1, x2, y2) {
    if (
        Math.min(x1, x2) <= x &&
        x <= Math.max(x1, x2) &&
        Math.min(y1, y2) <= y &&
        y <= Math.max(y1, y2)
    ) {
        return true;
    } else {
        return false;
    }
}


function determineAffiliation(event) {
    refreshCanvas();

    ctx.fillStyle = "yellow";
    ctx.fillRect(event.offsetX, event.offsetY, 1, 1);

    ctx.strokeStyle = "yellow";
    for (var i = 0; i < polygons.length; ++i) {
        if (pointInPolygon(polygons[i], [event.offsetX, event.offsetY]) === true) {
            ctx.moveTo(polygons[i][0][0], polygons[i][0][1]);
            for (var j = 1; j < polygons[i].length; ++j) {
                ctx.lineTo(polygons[i][j][0], polygons[i][j][1]);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function pointInPolygon(polygon, point) {
    const [x0, y0] = point;
    let count = 0;

    for (let i = 0; i < polygon.length; i++) {
        const [x1, y1] = polygon[i];
        const [x2, y2] = polygon[(i + 1) % polygon.length];

        if (y0 === y1 && x0 >= Math.min(x1, x2) && x0 <= Math.max(x1, x2)) {
            return true;
        }

        if ((y0 < y1 && y0 < y2) || (y0 > y1 && y0 > y2)) {
            continue;
        }

        const intersectX = ((x2 - x1) * (y0 - y1)) / (y2 - y1) + x1;
        if (x0 < intersectX) {
            count++;
        }
    }

    console.log("polygon = " + polygon, "point = " + point, "return = " + (count % 2 !== 0));

    return count % 2 !== 0;
}