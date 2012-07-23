// Global variables
var images = {};
var position;
var stones;
var next_player;                // ("white"|"black")
var next_action;                // ("put"|"take"|"move")
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
var neighborhood = [[1, 3], [0, 2], [1, 4], [0, 5], [2, 7], [3, 6], [5, 7], [4, 6]];

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
    c.clearRect(0, 0, board.width, board.height);
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
    stones = { "black" : { "store" : 9, "board" : 0 },
               "white" : { "store" : 9, "board" : 0 } };
    next_player = "white";
    next_action = "put";
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
    }
    return [x - board.offsetLeft, y - board.offsetTop];
}

function getStone(pos) {
    return position[pos[0]][pos[1]];
}

function setStone(pos, type) {
    position[pos[0]][pos[1]] = type;
}

function isInMill(pos) {
    if(!getStone(pos))
        return false;
    function check(list) {
        return list.indexOf(pos[1]) >= 0 &&
            position[pos[0]][list[0]] == position[pos[0]][list[1]] &&
            position[pos[0]][list[0]] == position[pos[0]][list[2]];
    }
    if(check([0, 1, 2]) || check([5, 6, 7])) // Horizontal check
        return true;
    if(check([0, 3, 5]) || check([2, 4, 7])) // Vertical check
        return true;
    if([1, 3, 4, 6].indexOf(pos[1]) >= 0 &&  // Trans-loop check
       position[0][pos[1]] == position[1][pos[1]] &&
       position[0][pos[1]] == position[2][pos[1]])
        return true;
    return false;
}

function areNeighbors(p, q) {
    if(p[1] == q[1] && Math.abs(p[0] - q[0]) == 1 &&
       [1, 3, 4, 6].indexOf(p[1]) >= 0)
        return true;
    if(p[0] != q[0])
        return false;
    if(neighborhood[p[1]][0] == q[1] || neighborhood[p[1]][1] == q[1])
        return true;
    return false;
}

function isValidMove(p, q) {
    // The function assumes that the stores are already empty.
    if(getStone(p) != next_player || getStone(q))
        return false;
    if(stones[next_player]["board"] > 3 && !areNeighbors(p, q))
        return false;
    return true;
}

function otherPlayer() {
    return next_player == "white" ? "black" : "white";
}

function allInMill(player) {
    for(var loop = 0; loop < 3; ++loop)
        for(var point = 0; point < 8; ++point) {
            var p = [loop, point];
            if(getStone(p) == player && !isInMill(p))
                return false;
        }
    return true;
}

function isValidTake(p) {
    var other = otherPlayer();
    return getStone(p) == other && (allInMill(other) || !isInMill(p));
}

function validMoves() {
    // Looks very expensive... there must be a better way to do this
    var moves = [];
    for(var loop = 0; loop < 3; ++loop)
        for(var point = 0; point < 8; ++point) {
            var p = [loop, point];
            if(getStone(p) != next_player)
                continue;
            for(var loop2 = 0; loop2 < 3; ++loop2)
                for(var point2 = 0; point2 < 8; ++point2) {
                    var q = [loop2, point2];
                    if(isValidMove(p, q))
                        moves.push([p, q]);
                }
        }
    return moves;
}

function hasLost() {
    // The function assumes that the stores are already empty.    
    return stones[next_player]["board"] < 3 || validMoves().length == 0;
}

function checkWin() {
    if(hasLost()) {
        alert("You have lost, " + next_player + "!");
        clearBoard();
    }
}

function clickEvent(event) {
    var xy = coordinates(event);
    var pos = findPoint(xy[0], xy[1], 17);
    if(!pos)
        return;
    var color = getStone(pos);
    switch(next_action) {
    case "move":
        if(color == next_player)
            selected = pos;
        else if(!color) {
            if(selected[0] >= 0 && isValidMove(selected, pos)) {
                setStone(pos, next_player);
                setStone(selected, false);
                selected = [-1, -1];
                if(isInMill(pos))
                    next_action = "take";
                else {
                    next_player = otherPlayer();
                    checkWin();
                }
            } else
                return;
        }
        break;
    case "put":
        if(color)
            return;
        setStone(pos, next_player);
        stones[next_player]["store"]--;
        stones[next_player]["board"]++;
        if(isInMill(pos))
            next_action = "take";
        else {
            next_player = otherPlayer();
            if(stones[next_player]["store"] == 0) {
                next_action = "move";
                checkWin();
            }
        }
        break;
    case "take":
        if(!isValidTake(pos))
            return;
        setStone(pos, false);
        next_player = otherPlayer();
        stones[next_player]["board"]--;
        if(stones[next_player]["store"] == 0) {
            next_action = "move";
            checkWin();
        } else
            next_action = "put";
        break;
    }
    drawBoard();
}

function setupEvents() {
    var board = document.getElementById("board");
    board.addEventListener("click",     clickEvent, false);
}

function init() {
    clearBoard();
    loadImages();
}

function init2() {
    // This is called automatically when all images have been loaded
    drawBoard();
    setupEvents();
}
