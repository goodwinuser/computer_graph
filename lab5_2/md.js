class point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var slider1 = document.getElementById("roughness");
const output1 = document.getElementById('output1');
var r = slider1.value;

var slider2 = document.getElementById("deep");
const output2 = document.getElementById('output2');
var deep = slider2.value;

slider1.oninput = function () {
    r = slider1.value;
    output1.innerHTML = slider1.value;
};

slider2.oninput = function () {
    deep = slider2.value;
    output2.innerHTML = slider2.value;
};

var canvas = document.getElementById("drawing");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
var left = new point(0, canvas.height / 2);
var right = new point(canvas.width, canvas.height / 2);
var points = [];

slider2.max = Math.ceil(Math.log2(canvas.width));

landscapeGenerator();

function landscapeGenerator() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
    points.push(left);
    points.push(right);
    MD(left, right, deep);
    points.sort((a, b) => a.x - b.x);
    drawLines();
    console.log(points.length);
    console.log(Math.log2(canvas.width));
}

function MD(left, right, deep) {
    l = Math.sqrt((left.x - right.x) * (left.x - right.x) + (left.y - right.y) * (left.y - right.y));
    midpoint = new point(
        (left.x + right.x) / 2,
        (left.y + right.y) / 2 + Math.random() * 2 * l * r - l * r
    );
    points.push(midpoint);
    ctx.fillRect(midpoint.x, midpoint.y, 1, 1);
    if (Math.abs(left.x - right.x) > 1 && deep > 1) {
        MD(left, midpoint, deep - 1);
        MD(midpoint, right, deep - 1);
    }
}

function drawLines() {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; ++i) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}