// Global variables
var images = {};
var position;

// Constants
var margin = 25;
var spacing = 40;
var board_size = margin * 2 + 4 * spacing; // also change in goro.html

function circle(context, x, y) {
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();
}

function coords(i, j) {
    return [margin + i * spacing, margin + j * spacing];
}

function putStone(i, j, color) {
    var board = document.getElementById("board");
    var c = board.getContext("2d");
    var xy = coords(i, j);
    c.drawImage(images[color], xy[0] - 17, xy[1] - 17);
}

function drawBoard() {
    var board = document.getElementById("board");
    var c = board.getContext("2d");
    c.clearRect(0, 0, board.width, board.height);
    c.lineWidth = 2;
    for(var i = margin; i < board_size; i += spacing) {
        c.beginPath();
        c.moveTo(margin, i); c.lineTo(board_size - margin, i);
        c.moveTo(i, margin); c.lineTo(i, board_size - margin);
        c.stroke();
    }
    circle(c, margin + 2 * spacing, margin + 2 * spacing);

    for(var i = 0; i < 5; ++i)
        for(var j = 0; j < 5; ++j) {
            var color = position[i][j];
            if(color)
                putStone(i, j, color);
        }
}

function clearBoard() {
    position =
        [[false, false, false, false, false],
         [false, false, false, false, false],
         [false, false, false, false, false],
         [false, false, false, false, false],
         [false, false, false, false, false]];
}

function loadImages() {
    var sources = {
        "black"   : "images/black.png",
        "white"   : "images/white.png",
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
    for(var i = 0; i < 5; ++i)
        for(var j = 0; j < 5; ++j) {
            var xy = coords(i, j);
            if(Math.abs(xy[0] - x) < threshold &&
               Math.abs(xy[1] - y) < threshold)
                return [i, j];
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
    }
    return [x - board.offsetLeft, y - board.offsetTop];
}

function getStone(pos) {
    return position[pos[0]][pos[1]];
}

function setStone(pos, type) {
    position[pos[0]][pos[1]] = type;
}

function clickEvent(event) {
    var xy = coordinates(event);
    var pos = findPoint(xy[0], xy[1], 17);
    if(!pos)
        return;
    var color = getStone(pos);
    if(event.shiftKey) {
        if(color == "white")
            setStone(pos, false);
        else
            setStone(pos, "white");
    } else {
        if(color == "black")
            setStone(pos, false);
        else
            setStone(pos, "black");
    }
    drawBoard();
    setCode(positionToCode());
}

function keyEvent(event) {
    if(event.keyCode == 13)
        load();
}

function setupEvents() {
    var board = document.getElementById("board");
    board.addEventListener("click", clickEvent, false);
}

function charToNum(c) {
    var n = c.toUpperCase().charCodeAt();
    if(n <= 57)
        return n - 48;
    else
        return n - 55;
}

function numToChar(n) {
    if(n < 10)
        return String.fromCharCode(48 + n);
    else
        return String.fromCharCode(55 + n);
}

function positionToCode() {
    var bits = new Array(50);
    for(var i = 0; i < 5; ++i)
        for(var j = 0; j < 5; ++j) {
            var k = (j * 5 + i) * 2;
            var color = position[i][j];
            if(color == "white")
                bits[k] = 1;
            else
                bits[k] = 0;
            if(color == "black")
                bits[k+1] = 1;
            else
                bits[k+1] = 0;
        }
    var code = "";
    for(var i = 0, k = 0; i < 10; ++i) {
        var n = 0;
        for(var j = 0; j < 5; ++j)
            n = n * 2 + bits[k++];
        code += numToChar(n);
    }
    return code;
}

function setCode(code) {
    document.getElementById("code").value = code;
}

function loadBoard(code, message) {
    if(code.length != 10)
        return;
    var bits = new Array(50);
    for(var i = 0; i < 10; ++i) {
        var n = charToNum(code[i]);
        if(n < 0 || n > 31)
            return;
        var k = i * 5 + 4;
        for(var j = 0; j < 5; ++j) {
            bits[k--] = n % 2;
            n = (n - n % 2) / 2;
        }
    }
    for(var i = 0; i < 5; ++i)
        for(var j = 0; j < 5; ++j) {
            var k = (j * 5 + i) * 2;
            if(bits[k] == 1 && bits[k+1] == 1)
                return;
        }
    for(var i = 0; i < 5; ++i)
        for(var j = 0; j < 5; ++j) {
            var k = (j * 5 + i) * 2;
            if(bits[k] == 0 && bits[k+1] == 0)
                position[i][j] = false;
            else if(bits[k] == 0)
                position[i][j] = "black";
            else
                position[i][j] = "white";
        }
    drawBoard();
    setCode(code);
    document.getElementById("message").innerHTML = message;
}

function load() {
    var code = document.getElementById("code").value;
    loadBoard(code, "&nbsp;");
}

function reset() {
    clearBoard();
    drawBoard();
    setCode("");
}

function init() {
    clearBoard();
    loadImages();
}

function init2() {
    // This is called automatically when all images have been loaded
    drawBoard();
    setCode("");
    setupEvents();
}
