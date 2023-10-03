const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const v1 = document.getElementById('v1');
const v2 = document.getElementById('v2');
const v1Canvas = document.getElementById('v1H');
const v2Canvas = document.getElementById('v2H');

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
                v1.width = img.width;
                v1.height = img.height;
                v2.width = img.width;
                v2.height = img.height;

                const originalCtx = originalCanvas.getContext('2d');
                originalCtx.drawImage(img, 0, 0);

                const imageData = originalCtx.getImageData(0, 0, img.width, img.height).data;

                drawChannelImage(v1, imageData, 'v1');
                drawChannelImage(v2, imageData, 'v2');

                const histogramDataV1 = new Uint8Array(imageData.length / 4);
                const histogramDataV2 = new Uint8Array(imageData.length / 4);


                const imageDataV1 = v1.getContext('2d').getImageData(0, 0, img.width, img.height).data;
                const imageDataV2 = v2.getContext('2d').getImageData(0, 0, img.width, img.height).data;

                for (let i = 0, j = 0; i < imageData.length; i += 4, j++) {
                    histogramDataV1[j] = imageDataV1[i];
                    histogramDataV2[j] = imageDataV2[i];
                }

                drawHistogram(v1Canvas, histogramDataV1);
                drawHistogram(v2Canvas, histogramDataV2);
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
        if(channel == "v1"){
            let data =  0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]
            channelData[j] = data
            channelData[j + 1] = data
            channelData[j + 2] = data
            channelData[j + 3] = 255;
        }
        else if(channel == "v2"){
            let data =  0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.722 * imageData[i + 2]
            channelData[j] = data
            channelData[j + 1] = data
            channelData[j + 2] = data
            channelData[j + 3] = 255;
        }

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

function drawHistogram(canvas, data) {
    const ctx = canvas.getContext('2d');
    const histogram = calculateHistogram(data);

    canvas.width = 290; // Added extra space to the right for X labels and left for Y labels
    canvas.height = 220; // Added extra space on the bottom for X labels

    ctx.strokeStyle = "black";
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