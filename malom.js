// Global variables
var images = {};
var position;
var selected = [-1, -1];

// Constants
var coords = {
    0 : [[ 40, 40], [250, 40], [460, 40],
         [ 40,250],            [460,250],
         [ 40,460], [250,460], [460,460]],
    1 : [[110,110], [250,110], [390,110],
         [110,250],            [390,250],
         [110,390], [250,390], [390,390]],
    2 : [[180,180], [250,180], [320,180],
         [180,250],            [320,250],
         [180,320], [250,320], [320,320]]
};

function circle(context, x, y) {
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();
}

function putStone(loop, point, color) {
    var board = document.getElementById("board");
    var c = board.getContext("2d");
    var xy = coords[loop][point];
    c.drawImage(images[color], xy[0] - 17, xy[1] - 17);
}

function drawBoard() {
    var board = document.getElementById("board");
    var c = board.getContext("2d");
    c.lineWidth = 2;
    for(var i = 40; i < 500; i += 70) {
        if(i == 250)
            continue;
        c.beginPath();
        c.moveTo(i, i); c.lineTo(i, 500 - i);
        c.moveTo(i, i); c.lineTo(500 - i, i);
        c.stroke();
        circle(c, i, i); circle(c, i, 500 - i);
        circle(c, i, 250); circle(c, 250, i);
    }
    c.moveTo( 40, 250); c.lineTo(180, 250);
    c.moveTo(460, 250); c.lineTo(320, 250);
    c.moveTo(250,  40); c.lineTo(250, 180);
    c.moveTo(250, 460); c.lineTo(250, 320);
    c.stroke();

    for(var loop = 0; loop < 3; ++loop)
        for(var point = 0; point < 8; ++point) {
            var color = position[loop][point];
            if(!color)
                continue;
            if(!(selected[0] == loop && selected[1] == point))
                putStone(loop, point, color);
            else
                putStone(loop, point, color == "black" ? "bselect" : "wselect");
        }
}

function clearBoard() {
    position =
        [[false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false]];
}

function loadImages() {
    var sources = {
        "black"   : "images/black.png",
        "white"   : "images/white.png",
        "bselect" : "images/black-selected.png",
        "wselect" : "images/white-selected.png"
    };
    var loaded = 0;
    function imageLoaded() {
        ++loaded;
        if(loaded == Object.keys(sources).length)
            init2();
    }
    for(var img in sources) {
        images[img] = new Image();
        images[img].onload = function() { imageLoaded(); };
        images[img].src = sources[img];
    }
}

function findPoint(x, y, threshold) {
    for(var loop = 0; loop < 3; ++loop)
        for(var point = 0; point < 8; ++point) {
            var xy = coords[loop][point];
            if(Math.abs(xy[0] - x) < threshold &&
               Math.abs(xy[1] - y) < threshold)
                return [loop, point];
        }
    return false;
}

function coordinates(event) {
    var board = document.getElementById('board');
    var x = event.pageX;
    var y = event.pageY;
    if (!x && !y) {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    };
    return [x - board.offsetLeft, y - board.offsetTop];
};

function clickEvent(event) {
    var xy = coordinates(event);
    var pos = findPoint(xy[0], xy[1], 17);
    if(!pos)
        return;
    var color = position[pos[0]][pos[1]];
    if(color)
        selected = pos;
    drawBoard();
}

function moveEvent(event) {
}

function setupEvents() {
    var board = document.getElementById("board");
    board.addEventListener("click",     clickEvent, false);
    board.addEventListener("mousemove", moveEvent,  false);
}

function init() {
    clearBoard();

    // Just for testing
    for(var loop = 0; loop < 3; ++loop)
        for(var point = 0; point < 8; ++point) {
            var r = Math.round(Math.random() * 2);
            if(r == 2)
                continue;
            position[loop][point] = r == 1 ? "black" : "white";
        }

    loadImages();
}

function init2() {
    // This is called automatically when all images have been loaded
    drawBoard();
    setupEvents();
}
