const imageInput = document.getElementById('imageInput');

var imageCanvas = document.getElementById('imageCanvas');
var imageCtx = imageCanvas.getContext("2d");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var isDrawingEnabled = false;

var button1 = document.getElementById("button1");
//button1.style.backgroundColor = "white"
var button2 = document.getElementById("button2");
//button2.style.backgroundColor = "white"
var button3 = document.getElementById("button3");
//button3.style.backgroundColor = "white"
var button4 = document.getElementById("button4");
//button4.style.backgroundColor = "white"
var button5 = document.getElementById("button5");
//button4.style.backgroundColor = "white"

var colorInput = document.getElementById("fillColor");
var colorInputBorder = document.getElementById("borderColor");

imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                imageCtx.drawImage(img, 0, 0);
            };
        };

        reader.readAsDataURL(file);
    }
}

canvas.addEventListener("mousedown", draw2);
canvas.addEventListener("mouseup", disableDrawing);
canvas.addEventListener("mousemove", draw);

var flag = 0;

function draw2(event) {
    if (flag === 1) {
        enableDrawing(event);
    }
    else if (flag === 2) {
        console.log(flag);
        floodFill(ctx.getImageData(0, 0, canvas.width, canvas.height), event.offsetX, event.offsetY, hex_to_rgba(colorInputBorder.value));
        //my_floodFill(ctx.getImageData(0, 0, canvas.width, canvas.height), event.offsetX, event.offsetY, 'rgba(255, 0, 0, 255)');
        return;
    }
    else if (flag === 3) {
        console.log(flag);
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        startFindBoundary(imageData, event.offsetX, event.offsetY, hex_to_rgba(colorInputBorder.value),
            `rgba(0, 255, 0, 255)`);
        ctx.putImageData(imageData, 0, 0);
        console.log("End");
        return;
    }
    else if (flag === 5) {
        console.log(flag);
        floodFillIMG(ctx.getImageData(0, 0, canvas.width, canvas.height), event.offsetX, event.offsetY, hex_to_rgba(colorInputBorder.value),
            imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height));
        return;
    }
}

function enableDrawing(event) {
    isDrawingEnabled = true;
    draw(event);
}

function disableDrawing() {
    isDrawingEnabled = false;
}

function draw(event) {
    if (!isDrawingEnabled || flag != 1) {
        return;
    }

    const x = event.offsetX;
    const y = event.offsetY;

    //console.log(event.offsetX, event.offsetY);

    ctx.fillStyle = colorInputBorder.value;
    ctx.fillRect(x, y, 8, 8);
}

button1.onclick = function () {
    if (flag !== 1) {
        flag = 1;
        button1.style.backgroundColor = "grey";
        button2.style.backgroundColor = "white";
        button3.style.backgroundColor = "white";
        button5.style.backgroundColor = "white";
    }
    else {
        flag = 0;
        button1.style.backgroundColor = "white";
    }
}

button2.onclick = function () {
    if (flag !== 2) {
        flag = 2;
        button1.style.backgroundColor = "white";
        button2.style.backgroundColor = "grey";
        button3.style.backgroundColor = "white";
        button5.style.backgroundColor = "white";
    }
    else {
        flag = 0;
        button2.style.backgroundColor = "white";
    }
}

button3.onclick = function () {
    if (flag !== 3) {
        flag = 3;
        button1.style.backgroundColor = "white";
        button2.style.backgroundColor = "white";
        button3.style.backgroundColor = "grey";
        button5.style.backgroundColor = "white";
    }
    else {
        flag = 0;
        button3.style.backgroundColor = "white";
    }
}

button4.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

button5.onclick = function () {
    if (flag !== 5) {
        flag = 5;
        button1.style.backgroundColor = "white";
        button2.style.backgroundColor = "white";
        button3.style.backgroundColor = "white";
        button5.style.backgroundColor = "grey";
    }
    else {
        flag = 0;
        button5.style.backgroundColor = "white";
    }
}

// Создаем функцию для определения цвета пикселя
function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return `rgba(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]}, ${imageData.data[index + 3]})`;
}

// Создаем функцию для установки цвета пикселя
function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    const rgba = color.match(/\d+/g);
    imageData.data[index] = rgba[0];
    imageData.data[index + 1] = rgba[1];
    imageData.data[index + 2] = rgba[2];
    imageData.data[index + 3] = rgba[3];
}

function hex_to_rgba(hex_color) {
    // Удаляем символ # из шестнадцатеричного значения цвета
    hex_color = hex_color.replace("#", "");

    // Разбиваем шестнадцатеричное значение на отдельные компоненты цвета
    var r = parseInt(hex_color.substring(0, 2), 16);
    var g = parseInt(hex_color.substring(2, 4), 16);
    var b = parseInt(hex_color.substring(4, 6), 16);

    // Возвращаем строку в формате RGBA
    return `rgba(${r}, ${g}, ${b}, ${255})`;
}

const set = [];

function floodFillLine(imageData, x, y, boundaryColor) {
    //console.log(set, set.length);
    for (let i = 0; i < set.length; i++) {
        const pair = set[i];
        if (pair[0] === x && pair[1] === y) {
            return;
        }
    }

    // Заливаем серию пикселов вправо
    let currentX = x, left, right;
    while (getPixelColor(imageData, currentX, y) !== boundaryColor && currentX < imageData.width) {
        set.push([currentX, y]);
        setPixelColor(imageData, currentX, y, hex_to_rgba(colorInput.value));
        currentX++;
    }
    right = currentX - 1;

    // Заливаем серию пикселов влево
    currentX = x - 1;
    while (getPixelColor(imageData, currentX, y) !== boundaryColor && currentX >= 0) {
        set.push([currentX, y]);
        setPixelColor(imageData, currentX, y, hex_to_rgba(colorInput.value));
        currentX--;
    }
    left = currentX + 1;

    //console.log(left, y, right, y);
    // ctx.beginPath();
    // ctx.moveTo(left, y);
    // ctx.lineTo(right, y);
    // ctx.strokeStyle = "green";
    // ctx.stroke();

    currentX = left;
    while (currentX !== right + 1) {
        if (getPixelColor(imageData, currentX, y + 1) !== boundaryColor && y < imageData.height) {
            let flag1 = false;
            for (let i = 0; i < set.length; i++) {
                const pair = set[i];
                if (pair[0] === currentX && pair[1] === y + 1) {
                    flag1 = true;
                }
            }
            if (flag1 === false) {
                floodFillLine(imageData, currentX, y + 1, boundaryColor);
            }
        }
        currentX++;
    }

    currentX = left;
    while (currentX !== right + 1) {
        if (getPixelColor(imageData, currentX, y - 1) !== boundaryColor && y - 1 >= 0) {
            let flag1 = false;
            for (let i = 0; i < set.length; i++) {
                const pair = set[i];
                if (pair[0] === currentX && pair[1] === y - 1) {
                    flag1 = true;
                }
            }
            if (flag1 === false) {
                floodFillLine(imageData, currentX, y - 1, boundaryColor);
            }
        }
        currentX++;
    }
}

// Создаем функцию для заливки области
function floodFill(imageData, startX, startY, boundaryColor) {
    floodFillLine(imageData, startX, startY, boundaryColor);
    ctx.putImageData(imageData, 0, 0);
    set.length = 0;
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i][0] === obj[0] && list[i][1] === obj[1]) {
            return true;
        }
    }

    return false;
}

function neighborsBoundaries(imageData, x, y, boundaryColor) {
    const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
        [x - 1, y - 1],
        [x - 1, y + 1],
        [x + 1, y + 1],
        [x + 1, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
        if (getPixelColor(imageData, nx, ny) === boundaryColor) {
            return true;
        }
    }
    return false;
}

function startFindBoundary(imageData, startX, startY, boundaryColor, fillColor) {
    let currentX = startX;
    while (getPixelColor(imageData, currentX, startY) != boundaryColor) {
        currentX++;
    }
    findBoundary(imageData, currentX - 1, startY, boundaryColor, fillColor)
}

// // Создаем функцию для обхода границы связной области
function findBoundary(imageData, startX, startY, boundaryColor, fillColor) {
    const boundaryPixels = [];
    const visited = [];
    const stack = [];
    stack.push([startX, startY]);
    visited.push([startX, startY]);
    boundaryPixels.push([startY, startX]);
    while (stack.length) {
        const [x, y] = stack.pop();

        const neighbors = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
            [x - 1, y - 1],
            [x - 1, y + 1],
            [x + 1, y + 1],
            [x + 1, y - 1],
        ];
        for (const [nx, ny] of neighbors) {

            if (!containsObject([nx, ny], visited)) {
                if (getPixelColor(imageData, nx, ny) !== boundaryColor) {
                    if (neighborsBoundaries(imageData, nx, ny, boundaryColor)) {
                        stack.push([nx, ny]);
                        boundaryPixels.push([ny, nx]);
                    }
                }
                visited.push([nx, ny]);
            }
        }
    }

    for (const [ny, nx] of boundaryPixels) {
        setPixelColor(imageData, nx, ny, fillColor);
    }

    boundaryPixels.sort();
    // for (const [ny, nx] of boundaryPixels) {
    //     console.log([nx, ny]);
    // }

    var i;
    for (i = 0; i < boundaryPixels.length - 1; i++) {
        if (boundaryPixels[i][0] === boundaryPixels[i + 1][0]) {
            let left = boundaryPixels[i][1] + 1, right = boundaryPixels[i + 1][1];
            //console.log(boundaryPixels[i][0], left, "Start");
            while (getPixelColor(imageData, left, boundaryPixels[i][0]) !== boundaryColor && left != right
                && getPixelColor(imageData, left, boundaryPixels[i][0]) !== fillColor) {
                left++;
            }
            //console.log(boundaryPixels[i][0], left, "End");
            if (getPixelColor(imageData, left, boundaryPixels[i][0]) === boundaryColor) {
                findBoundary1(imageData, left - 1, boundaryPixels[i][0], boundaryColor, fillColor);
                //setPixelColor(imageData, left - 1, boundaryPixels[i][0], fillColor);
                //console.log("Found border", left - 1, boundaryPixels[i][0]);
            }
        }
    }

    return boundaryPixels;
}

function findBoundary1(imageData, startX, startY, boundaryColor, fillColor) {
    const boundaryPixels = [];
    const visited = [];
    const stack = [];
    stack.push([startX, startY]);
    visited.push([startX, startY]);
    boundaryPixels.push([startY, startX]);
    while (stack.length) {
        const [x, y] = stack.pop();

        const neighbors = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
            [x - 1, y - 1],
            [x - 1, y + 1],
            [x + 1, y + 1],
            [x + 1, y - 1],
        ];
        for (const [nx, ny] of neighbors) {

            if (!containsObject([nx, ny], visited)) {
                if (getPixelColor(imageData, nx, ny) !== boundaryColor) {
                    if (neighborsBoundaries(imageData, nx, ny, boundaryColor)) {
                        stack.push([nx, ny]);
                        boundaryPixels.push([ny, nx]);
                    }
                }
                visited.push([nx, ny]);
            }
        }
    }

    for (const [ny, nx] of boundaryPixels) {
        setPixelColor(imageData, nx, ny, fillColor);
    }

    return boundaryPixels;
}

// Создаем функцию для заливки области изображением
function floodFillIMG(canvasData, startX, startY, boundaryColor, imageData) {
    floodFillLineIMG(canvasData, startX, startY, startX, startY, boundaryColor, imageData);
    ctx.putImageData(canvasData, 0, 0);
    set.length = 0;
}

function floodFillLineIMG(canvasData, x, y, startX, startY, boundaryColor, imageData) {
    //console.log(set, set.length);
    for (let i = 0; i < set.length; i++) {
        const pair = set[i];
        if (pair[0] === x && pair[1] === y) {
            return;
        }
    }

    // Заливаем серию пикселов вправо
    let currentX = x;
    while (getPixelColor(canvasData, currentX, y) !== boundaryColor && currentX < canvasData.width) {
        set.push([currentX, y]);
        const xx = ((currentX - startX) % imageData.width + imageData.width) % imageData.width,
            yy = ((y - startY) % imageData.height + imageData.height) % imageData.height;
        const index = (yy * imageData.width + xx) * 4;
        //console.log(xx, yy, index);
        const color = `rgba(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]}, ${imageData.data[index + 3]})`;
        setPixelColor(canvasData, currentX, y, color);
        currentX++;
    }
    let right = currentX - 1;

    // Заливаем серию пикселов влево
    currentX = x - 1;
    while (getPixelColor(canvasData, currentX, y) !== boundaryColor && currentX >= 0) {
        set.push([currentX, y]);
        const xx = ((currentX - startX) % imageData.width + imageData.width) % imageData.width,
            yy = ((y - startY) % imageData.height + imageData.height) % imageData.height;
        const index = (yy * imageData.width + xx) * 4;
        //console.log(xx, yy, index);
        const color = `rgba(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]}, ${imageData.data[index + 3]})`;
        setPixelColor(canvasData, currentX, y, color);
        currentX--;
    }
    let left = currentX + 1;

    // ctx.beginPath();
    // ctx.moveTo(left, y);
    // ctx.lineTo(right, y);
    // ctx.strokeStyle = "red";
    // ctx.stroke();
    // ctx.closePath();

    currentX = left;
    while (currentX !== right + 1) {
        if (getPixelColor(canvasData, currentX, y + 1) !== boundaryColor && y + 1 < canvasData.height) {
            let flag1 = false;
            for (let i = 0; i < set.length; i++) {
                const pair = set[i];
                if (pair[0] === currentX && pair[1] === y + 1) {
                    flag1 = true;
                }
            }
            if (flag1 === false) {
                floodFillLineIMG(canvasData, currentX, y + 1, startX, startY, boundaryColor, imageData);
            }
        }
        currentX++;
    }

    currentX = left;
    while (currentX !== right + 1) {
        if (getPixelColor(canvasData, currentX, y - 1) !== boundaryColor && y - 1 >= 0) {
            let flag1 = false;
            for (let i = 0; i < set.length; i++) {
                const pair = set[i];
                if (pair[0] === currentX && pair[1] === y - 1) {
                    flag1 = true;
                }
            }
            if (flag1 === false) {
                floodFillLineIMG(canvasData, currentX, y - 1, startX, startY, boundaryColor, imageData);
            }
        }
        currentX++;
    }
}