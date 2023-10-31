const canvas = document.getElementById('main');
let ctx = canvas.getContext('2d');

// i - номер вершины, n - количество вершин, t - положение кривой (от 0 до 1)
function getBezierBasis(i, n, t) {
	function f(n) {
		return (n <= 1) ? 1 : n * f(n - 1);
	};
	
	return (f(n) / (f(i) * f(n - i))) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

// arr - массив опорных точек. Точка - двухэлементный массив, (x = arr[0], y = arr[1])
// step - шаг при расчете кривой (0 < step < 1), по умолчанию 0.01
function getBezierCurve(arr, step) {
	if (step == undefined) {
		step = 0.01;
	}
	
	var res = new Array()
	
	for (var t = 0; t < 1 + step; t += step) {
		if (t > 1) {
			t = 1;
		}
		
		var ind = res.length;
		
		res[ind] = new Array(0, 0);
		
		for (var i = 0; i < arr.length; i++) {
			var b = getBezierBasis(i, arr.length - 1, t);
			
			res[ind][0] += arr[i].x * b;
			res[ind][1] += arr[i].y * b;
		}
	}
	
	return res;
}

// ctx - rendering context холста, arr - массив точек по которым строим кривую
function drawLines(ctx, arr) {
	var i = 0;
	
	while (true) {
		if (i >= arr.length - 1) {
			return;
		}
		
		ctx.moveTo(arr[i][0],arr[i][1]);
		ctx.lineTo(arr[i+1][0],arr[i+1][1]);
		ctx.stroke();
	
		++i;
	}
}

let isCapsOn = false;


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


    if (typeof points[0] != 'undefined' && 
    typeof points[1] != 'undefined' && 
    typeof points[2] != 'undefined' && 
    typeof points[3] != 'undefined') {
        ctx.beginPath();
        ctx.lineWidth = 1;
        flow = getBezierCurve(new Array(points[0], points[1], points[2], points[3]), 0.01);
	    drawLines(ctx, flow);
        ctx.closePath();
    }
}

function draw_points(event) {
    if(!isCapsOn){
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
}


function add_points(event) {
    let x = event.pageX;
    let y = event.pageY;

    for(let i = 0; i < points.length; i++){
        if(typeof points[i] == 'undefined'){
            points[i] = { 'x': x, 'y': y };
        }
    }
    draw_line();
}

function dist(x1, y1, x2, y2){
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

function near_point(event){
    let min_point = 0;
    let min_dist = 1000;

    let x = event.pageX;
    let y = event.pageY;

    for(let i = 0; i < points.length; i++){
        if(min_dist > dist(points[i].x, points[i].y, x, y)){
            min_dist = dist(points[i].x, points[i].y, x, y);
            min_point = i;
        }
    }
    return min_point;
}

function delete_point(event){
    let point = near_point(event);
    points[point] = undefined;
    draw_line();
}

function check_key(event){
    flag = false;
    for(let i = 0; i < points.length; i++){
        if(typeof points[i] == 'undefined'){
            flag = true;
        }
    }

    if(flag){
        add_points(event);
    } else {
        delete_point(event);
    }
}

function move_point(event){
    if(isCapsOn){
        let point = near_point(event);

        let x = event.pageX;
        let y = event.pageY;
        points[point] = { 'x': x, 'y': y };
        draw_line();
    }
}

function save_caps(event){
    isCapsOn = event.getModifierState("CapsLock");
}

canvas.addEventListener("click", draw_points);
canvas.addEventListener("wheel", check_key);
canvas.addEventListener("keydown", save_caps)
canvas.addEventListener("mousemove", move_point)