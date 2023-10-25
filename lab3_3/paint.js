const fpcolor = document.getElementById('fp');
const spcolor = document.getElementById('sp');
const tpcolor = document.getElementById('tp');

const canvas = document.getElementById('main');
let ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.strokeStyle = 'black';

let points = new Array(3);
let index = 0;

colorA = [255, 0, 0, 255]
colorB = [0, 255, 0, 255]
colorC = [0, 0, 255, 255]

function ShadeBackgroundPixel(x, y)
{

    let l1 = ((points[1].y - points[2].y) * (x - points[2].x) + (points[2].x - points[1].x) * (y - points[2].y)) / ((points[1].y - points[2].y) * (points[0].x - points[2].x) + (points[2].x - points[1].x) * (points[0].y - points[2].y))
    let l2 = ((points[2].y - points[0].y) * (x - points[2].x) + (points[0].x - points[2].x) * (y - points[2].y)) / ((points[1].y - points[2].y) * (points[0].x - points[2].x) + (points[2].x - points[1].x) * (points[0].y - points[2].y))
    let l3 = 1 - l1 - l2;
    if (l1 >= 0 && l1 <= 1 && l2 >= 0 && l2 <= 1 && l3 >= 0 && l3 <= 1)
    {
        r = l1 * colorA[0]+ l2 * colorB[0] + l3 * colorC[0];
        g = l1 * colorA[1]+ l2 * colorB[1] + l3 * colorC[1];
        b = l1 * colorA[2]+ l2 * colorB[2] + l3 * colorC[2];
        return [r, g, b];
    }
 
    return undefined;
}


function rasterization(){
    if (typeof points[2] != 'undefined'){
        let minx = 10000;
        let maxx = -10000;
        let miny = 10000;
        let maxy = -10000;

        for(let i =0;i<points.length;i++){
            if(points[i].x < minx){
                minx = points[i].x;
            }
            if(points[i].x > maxx){
                maxx = points[i].x;
            }
            if(points[i].y < miny){
                miny = points[i].y;
            }
            if(points[i].y > maxy){
                maxy = points[i].y;
            }
        }
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var imageDataArr = imageData.data;

        for(let i = minx; i< maxx; i++){
            for(let j = miny; j< maxy; j++){
                clr = ShadeBackgroundPixel(i, j);
                if(clr != undefined){
                    var n = j * canvas.width * 4  + i * 4;
                    imageDataArr[n] = clr[0];
                    imageDataArr[n + 1] = clr[1];
                    imageDataArr[n + 2] = clr[2];
                    imageDataArr[n + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData,  0, 0);
    }
}


function draw_triangle(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (typeof  points[1] != 'undefined'){
        if (typeof points[2] == 'undefined'){
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
        } else {
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.lineTo(points[2].x, points[2].y);
            ctx.lineTo(points[0].x, points[0].y);
        }
    }
    ctx.closePath();
    ctx.stroke();

    rasterization();
}

function draw_points(event) {
    if(index === 3){
        index = 0;
        points = new Array(3);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    let x = event.pageX;
    let y = event.pageY;

    points[index++] = {'x':x ,'y':y};
    draw_triangle();
}


function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}

hexToRgbA('#fbafff')


function change_color(event) {
    let fpcv = hexToRgbA(fpcolor.value);
    colorA = [fpcv[0], fpcv[1], fpcv[2], 255];

    let spcv = hexToRgbA(spcolor.value);
    colorB = [spcv[0], spcv[1], spcv[2], 255];

    let tpcv = hexToRgbA(tpcolor.value);
    colorC = [tpcv[0], tpcv[1], tpcv[2], 255];

    rasterization();
}



canvas.addEventListener("click", draw_points);
fpcolor.addEventListener("change", change_color);
spcolor.addEventListener("change", change_color);
tpcolor.addEventListener("change", change_color);