const canvas = document.getElementById('main');
let ctx = canvas.getContext('2d');


let points = new Array(4);
let index = 0;

function draw_line() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (typeof points[0] != 'undefined') {
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    if (typeof points[1] != 'undefined') {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(points[1].x, points[1].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    if (typeof points[2] != 'undefined') {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(points[2].x, points[2].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    if (typeof points[3] != 'undefined') {
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(points[3].x, points[3].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }


    if (typeof points[3] != 'undefined') {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(points[0].x, points[0].y);
        ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        ctx.stroke();
        ctx.closePath();
    }
}

function draw_points(event) {
    if (index === 4) {
        index = 0;
        points = new Array(4);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    let x = event.pageX;
    let y = event.pageY;

    points[index++] = { 'x': x, 'y': y };
    draw_line();
}



canvas.addEventListener("click", draw_points);