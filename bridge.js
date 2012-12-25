var players = ["N", "S", "W", "E"];
var suits = ["♠", "<font color=\"red\">♥</font>", "<font color=\"red\">♦</font>", "♣"];
var names = ["North", "East", "South", "West"];
var cards = [];
var dealer, vulnerability;

function init() {
    invisible_hand = "";
    for(var i = 0; i < 4; ++i) {
        for(var j = 0; j < 15; ++j)
            invisible_hand += "&nbsp;";
        invisible_hand += "<br />";
    }
    document.getElementsByName("player")[1].checked = true;
    loadDeal(1);
}

function loadDeal(code) {
    document.getElementById("code").value = code;
    document.getElementById("partner").checked = false;
    document.getElementById("others").checked = false;
    setupCards(code);
    showDeal();
}

function shuffle() {
    for(var i = 0; i < 51; ++i) {
        var j = Math.floor(Math.random() * (51 - i)) + i + 1;
        var tmp = cards[i];
        cards[i] = cards[j];
        cards[j] = tmp;
    }
}

function setupCards(code) {
    for(var i = 0; i < 4; ++i)
        for(var j = 0; j < 13; ++j)
            cards[i * 13 + j] = players[i];
    
    Math.seedrandom(code);
    shuffle();
    shuffle();
    shuffle();
    dealer = Math.floor(Math.random() * 4);
    vulnerability = Math.floor(Math.random() * 4);
}

function getHand(player) {
    var code = document.getElementById("code").value;
    var hand = "";
    for(var i = 0; i < 4; ++i) {
        hand += "&nbsp;" + suits[i] + " ";
        var empty = 0;
        for(var j = 0; j < 13; ++j)
            if(cards[i * 13 + j] == player)
                switch(j) {
                case 0: hand += "A"; break;
                case 1: hand += "K"; break;
                case 2: hand += "D"; break;
                case 3: hand += "J"; break;
                case 4: hand += "T"; break;
                default: hand += 14 - j;
                }
            else ++empty;
        for(var j = 0; j < empty; ++j)
            hand += "&nbsp;";
        hand += "<br />";
    }
    return hand;
}

function showDeal() {
    var player_north = document.getElementsByName("player")[0].checked;
    var show_partner = document.getElementById("partner").checked;
    var show_others = document.getElementById("others").checked;
    if(player_north || show_partner || show_others)
        document.getElementById("north").innerHTML = getHand("N");
    else document.getElementById("north").innerHTML = invisible_hand;
    if(!player_north || show_partner || show_others)
        document.getElementById("south").innerHTML = getHand("S");
    else document.getElementById("south").innerHTML = invisible_hand;
    if(show_others) {
        document.getElementById("west").innerHTML = getHand("W");
        document.getElementById("east").innerHTML = getHand("E");
    } else {
        document.getElementById("west").innerHTML = invisible_hand;
        document.getElementById("east").innerHTML = invisible_hand;
    }
    var names_str = "";
    for(var i = 0; i < 4; ++i) {
        var is_dealer = dealer == i;
        var is_vulnerable = vulnerability & (1 << (i % 2));
        names_str += "<span class=\"" +
            (is_dealer ? "dealer " : "") + (is_vulnerable ? "vulnerable " : "") +
            "\">" + names[i] + "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
    }
    document.getElementById("names").innerHTML = names_str;
}

function load() {
    var code = document.getElementById("code").value;
    loadDeal(code);
}

function prev() {
    var code = parseInt(document.getElementById("code").value);
    code -= 1;
    if(code < 1)
        code = 1;
    loadDeal(code);
}

function next() {
    var code = parseInt(document.getElementById("code").value);
    code += 1;
    loadDeal(code);
}

function keyEvent(event) {
    if(event.keyCode == 13)
        load();
}
