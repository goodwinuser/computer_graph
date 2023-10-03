const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const redCanvas = document.getElementById('redCanvas');
const greenCanvas = document.getElementById('greenCanvas');
const blueCanvas = document.getElementById('blueCanvas');
const redHistogram = document.getElementById('redHistogram');
const greenHistogram = document.getElementById('greenHistogram');
const blueHistogram = document.getElementById('blueHistogram');

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
                redCanvas.width = img.width;
                redCanvas.height = img.height;
                greenCanvas.width = img.width;
                greenCanvas.height = img.height;
                blueCanvas.width = img.width;
                blueCanvas.height = img.height;

                const originalCtx = originalCanvas.getContext('2d');
                originalCtx.drawImage(img, 0, 0);

                const imageData = originalCtx.getImageData(0, 0, img.width, img.height).data;

                drawChannelImage(redCanvas, imageData, 'red');
                drawChannelImage(greenCanvas, imageData, 'green');
                drawChannelImage(blueCanvas, imageData, 'blue');

                const redData = new Uint8Array(imageData.length / 4);
                const greenData = new Uint8Array(imageData.length / 4);
                const blueData = new Uint8Array(imageData.length / 4);

                for (let i = 0, j = 0; i < imageData.length; i += 4, j++) {
                    redData[j] = imageData[i];
                    greenData[j] = imageData[i + 1];
                    blueData[j] = imageData[i + 2];
                }

                drawHistogram(redHistogram, redData, 'red');
                drawHistogram(greenHistogram, greenData, 'green');
                drawHistogram(blueHistogram, blueData, 'blue');
            };
        };

        reader.readAsDataURL(file);
    }
}

function drawChannelImage(canvas, imageData, channel) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const channelImageData = ctx.createImageData(width, height);
    const channelData = channelImageData.data;

    for (let i = 0, j = 0; i < imageData.length; i += 4, j += 4) {
        if (channel === 'red') {
            channelData[j] = imageData[i];
            channelData[j + 1] = 0;
            channelData[j + 2] = 0;
        } else if (channel === 'green') {
            channelData[j] = 0;
            channelData[j + 1] = imageData[i + 1];
            channelData[j + 2] = 0;
        } else if (channel === 'blue') {
            channelData[j] = 0;
            channelData[j + 1] = 0;
            channelData[j + 2] = imageData[i + 2];
        }
        channelData[j + 3] = 255;
    }

    ctx.putImageData(channelImageData, 0, 0);
}

// function drawHistogram(canvas, data, color) {
//     const ctx = canvas.getContext('2d');
//     const histogram = calculateHistogram(data);

//     canvas.width = 256;
//     canvas.height = 200;

//     ctx.strokeStyle = color;
//     ctx.lineWidth = 2;
//     ctx.beginPath();

//     for (let i = 0; i < 256; i++) {
//         const normalizedValue = histogram[i] / Math.max(...histogram);
//         const barHeight = normalizedValue * canvas.height;
//         ctx.moveTo(i, canvas.height);
//         ctx.lineTo(i, canvas.height - barHeight);
//     }

//     ctx.stroke();
// }

function drawHistogram(canvas, data, color) {
    const ctx = canvas.getContext('2d');
    const histogram = calculateHistogram(data);

    canvas.width = 290; // Added extra space to the right for X labels and left for Y labels
    canvas.height = 220; // Added extra space on the bottom for X labels

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < 256; i++) {
        const normalizedValue = histogram[i] / Math.max(...histogram);
        const barHeight = normalizedValue * (canvas.height - 20); // Deducted 20 from height for the X labels
        ctx.moveTo(i + 30, canvas.height - 20); // Deducted 20 for X labels and added 30 for Y labels
        ctx.lineTo(i + 30, (canvas.height - 20) - barHeight);
    }

    ctx.stroke();

    // Draw labels on x and y axis
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    const xAxisLabelsInterval = 50;
    const yAxisLabelsInterval = 3000;

    // X Axis labels
    for (let i = 0; i <= 255; i += xAxisLabelsInterval) {
        ctx.fillText(i, i + 30, canvas.height - 5);
    }

    // Y Axis labels
    const maxHistogramValue = Math.max(...histogram);
    const numberOfYLabels = maxHistogramValue / yAxisLabelsInterval;
    const step = (canvas.height - 20) / (numberOfYLabels + 1);

    for (let i = 1; i <= numberOfYLabels; i++) {
        const yPosition = (canvas.height - 20) - i * step;
        ctx.fillText(i * yAxisLabelsInterval, 5, yPosition);
    }
}

function calculateHistogram(data) {
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i++) {
        histogram[data[i]]++;
    }

    return histogram;
}