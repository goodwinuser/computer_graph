const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const HSVCanvas = document.getElementById('HSVCanvas');
const slider1 = document.getElementById('slider1');
const output1 = document.getElementById('output1');
const slider2 = document.getElementById('slider2');
const output2 = document.getElementById('output2');
const slider3 = document.getElementById('slider3');
const output3 = document.getElementById('output3');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');

//var fs = require('fs');
// define(function (require) {
//     var fs = require('file-system');
// });

slider1.addEventListener('input', updateValue1);
slider2.addEventListener('input', updateValue2);
slider3.addEventListener('input', updateValue3);

imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;

                const originalCtx = originalCanvas.getContext('2d');
                originalCtx.drawImage(img, 0, 0);

                const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
                const data = imageData.data;

                HSVCanvas.width = img.width;
                HSVCanvas.height = img.height;
                const HSVCtx = HSVCanvas.getContext('2d');
                HSVCtx.drawImage(img, 0, 0);

                const changedImageData = HSVCtx.getImageData(0, 0, HSVCanvas.width, HSVCanvas.height);
                const changedData = imageData.data;

                // Проходимся по каждому пикселю и преобразуем его из RGB в HSV
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const hsv = rgbToHsv(r, g, b);

                    // Преобразуем значения HSV обратно в RGB и записываем их в данные пикселей
                    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
                    changedData[i] = rgb.r;
                    changedData[i + 1] = rgb.g;
                    changedData[i + 2] = rgb.b;
                }

                HSVCtx.putImageData(changedImageData, 0, 0);

                // console.log('Исходное изображение:', originalCanvas.toDataURL());
                // console.log('Преобразованное изображение:', HSVCanvas.toDataURL());
            };
        };

        reader.readAsDataURL(file);
    }
}

function updateValue1() {
    output1.innerHTML = slider1.value;
}

function updateValue2() {
    output2.innerHTML = slider2.value;
}

function updateValue3() {
    output3.innerHTML = slider3.value;
}

button1.onclick = async function () {
    // Button clicked
    console.log('Работает');
    let text1 = +slider1.value;
    let text2 = +slider2.value;
    let text3 = +slider3.value;

    const HSVCtx = HSVCanvas.getContext('2d');
    const changedImageData = HSVCtx.getImageData(0, 0, HSVCanvas.width, HSVCanvas.height);
    const ctx = originalCanvas.getContext('2d');
    const originalImageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

    const modifiedData = changeHsv(originalImageData, changedImageData, text1, text2, text3);
    //const modifiedData = changeHsv(changedImageData, 0.1, -0.1, 0.1);
    HSVCtx.putImageData(modifiedData, 0, 0);
}

button2.onclick = function () {
    // Button clicked
    console.log('Работает');
    let text1 = +slider1.value;
    let text2 = +slider2.value;
    let text3 = +slider3.value;

    const ctx = originalCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

    const HSVCtx = HSVCanvas.getContext('2d');
    HSVCtx.putImageData(imageData, 0, 0);
}

button3.onclick = function () {
    const base64Image = HSVCanvas.toDataURL('image/png');
    // fs.writeFile("out.png", base64Data, 'base64', function (err) {
    //     console.log(err);
    // });
}

function changeHsv(originalImageData, imageData, h, s, v) {
    // Получаем данные пикселей изображения
    const data = imageData.data;
    const originalData = originalImageData.data;

    // Проходимся по каждому пикселю
    for (let i = 0; i < originalData.length; i += 4) {
        // Получаем значения RGB пикселя
        const r = originalData[i];
        const g = originalData[i + 1];
        const b = originalData[i + 2];

        // Преобразуем RGB в HSV
        const hsv = rgbToHsv(r, g, b);

        // Изменяем значения параметров HSV
        // hsv.h += h;
        // hsv.s += s;
        // hsv.v += v;

        // // Ограничиваем значения параметров в диапазоне от 0 до 1
        // hsv.h = Math.max(0, Math.min(360, hsv.h));
        // hsv.s = Math.max(0, Math.min(100, hsv.s));
        // hsv.v = Math.max(0, Math.min(100, hsv.v));

        // Преобразуем HSV обратно в RGB
        //console.log(hsv);
        const rgb = hsvToRgb(Math.abs((hsv.h + h + 360) % 360), Math.max(0, Math.min(100, hsv.s + s)), Math.max(0, Math.min(100, hsv.v + v)));
        //console.log(rgb);
        // Устанавливаем новые значения RGB пикселя
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
    }

    // Возвращаем измененные данные пикселей
    return imageData;
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max * 100;

    const d = max - min;
    s = max === 0 ? 0 : d / max * 100;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = 60 * ((g - b) / d + (g < b ? 6 : 0));
                break;
            case g:
                h = 60 * ((b - r) / d + 2);
                break;
            case b:
                h = (60 * (r - g) / d + 4);
                break;
        }
    }

    return { h, s, v };
}

function hsvToRgb(h, s, v) {
    let r, g, b;

    const i = Math.floor(h / 60) % 6;
    const Vmin = (100 - s) * v / 100;
    const a = (v - Vmin) * (h % 60) / 60;
    const Vinc = Vmin + a;
    const Vdec = v - a;

    switch (i) {
        case 0:
            r = v;
            g = Vinc;
            b = Vmin;
            break;
        case 1:
            r = Vdec;
            g = v;
            b = Vmin;
            break;
        case 2:
            r = Vmin;
            g = v;
            b = Vinc;
            break;
        case 3:
            r = Vmin;
            g = Vdec;
            b = v;
            break;
        case 4:
            r = Vinc;
            g = Vmin;
            b = v;
            break;
        case 5:
            r = v;
            g = Vmin;
            b = Vdec;
            break;
    }

    return {
        r: Math.round(r * 255 / 100),
        g: Math.round(g * 255 / 100),
        b: Math.round(b * 255 / 100)
    };
}