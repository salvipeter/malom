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
    var code = "";
    for(var type = 0; type <= 1; ++type)
        for(var j = 0; j < 5; ++j) {
            var n = 0;
            for(var i = 0; i < 5; ++i) {
                var color = position[i][j];
                n *= 2;
                if(color == (type ? "white" : "black"))
                    ++n;
            }
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
    var black_rows = new Array(5);
    var white_rows = new Array(5);
    for(var i = 0; i < 5; ++i) {
        black_rows[i] = charToNum(code[i]);
        white_rows[i] = charToNum(code[i+5]);
        if(black_rows[i] < 0 || black_rows[i] > 31)
            return;
        if(white_rows[i] < 0 || white_rows[i] > 31)
            return;
        if((black_rows[i] & white_rows[i]) != 0)
            return;
    }
    for(var j = 0; j < 5; ++j) {
        var br = black_rows[j];
        var wr = white_rows[j];
        for(var i = 4; i >= 0; --i) {
            if(br % 2) {
                position[i][j] = "black";
                --br;
            } else if(wr % 2) {
                position[i][j] = "white";
                --wr;
            } else
                position[i][j] = false;
            br /= 2; wr /= 2;
        }
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
    loadBoard("0000000000", "&nbsp;");
}

function init() {
    position = new Array(5);
    for(var i = 0; i < 5; ++i)
        position[i] = new Array(5);
    loadImages();
}

function init2() {
    // This is called automatically when all images have been loaded
    reset();
    setupEvents();
}
