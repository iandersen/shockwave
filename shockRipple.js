var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var grids = [];
var TYPES = {
    empty: 0,
    button: 1,
    target: 2
};
var SCREENS = {
    menu: 0,
    levels: 1,
    game: 2
};
var currentScreen = SCREENS.menu;
var ROOM_SPEED = 30;
var wasMouseClicked = 0;

var TopBarButton = function(text, callback){
    this.text = text;
    this.onClick = callback
};

var Point = function(x,y){
    this.x = x;
    this.y = y;
};

var mousePos = new Point(0,0);

var BUTTONS = [
    new TopBarButton('\uf021', restartButtonClicked),
    new TopBarButton('\uf03a', listButtonClicked),
    new TopBarButton('\uF015', homeButtonClicked)
];

// window.onload = loadGrids;
document.fonts.ready.then(loadGrids);
var activeGrid = null;
var selectedGrid = null;

function loadGrids() {
    $.getJSON('./grids.json', function(json){
        grids = json;
        start();
    });
}

canvas.addEventListener('click', mouseClicked);
canvas.addEventListener('mousemove', mouseMoved);

function mouseMoved(event){
    mousePos = getMousePoint(event);
}


var url = (window.location !== window.parent.location)
    ? document.referrer
    : document.location.href;
console.log('Being accessed from ', url);
// $.post('https://htmlhigh5.com/remotePlay', {url: url, game: 'shockripple'});

function start(){
    // initializeGrid(grids[7]);
    draw();
}

function setScreen(screen){
    currentScreen = screen;
}

function draw(){
    var size = Math.min(window.innerHeight, window.innerWidth);
    canvas.height = size;
    canvas.width = size * canvas.height / (canvas.height + getTopBarHeight());
    context.height = canvas.height;
    context.width = canvas.width;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch(currentScreen){
        case SCREENS.menu:
            drawMenu();
        break;
        case SCREENS.levels:
            drawLevels();
        break;
        case SCREENS.game:
            drawTopBar();
            if(activeGrid)
                drawGrid();
        break;
        default: console.log('Unknown screen: ', currentScreen); break;
    }
    setTimeout(draw,1000/ROOM_SPEED);
    if(wasMouseClicked)
        wasMouseClicked -= 1;
}

function getTopBarHeight(){
    if(currentScreen === SCREENS.game)
        return canvas.height / 15;
    return 0;
}

function drawMenu(){
    var menuGrid = [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];
    if(!selectedGrid)
        initializeGrid(menuGrid);
    updateMenuGrid();
    drawGrid();
    context.globalAlpha = .7;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    drawLogo();
    drawMenuButtons();
}

var menuColors = [];

function drawLogo(){
    var menuText = "ShockRipple";
    var fontSize = Math.round(canvas.width / 10);
    while(menuColors.length < menuText.length)
        menuColors.push(randomColor());
    context.font = fontSize + 'px Arial';
    context.textBaseline = 'top';
    context.textAlign = 'left';
    var totalWidth = context.measureText(menuText).width;
    var textY = 20;
    var textX = canvas.width / 2 - totalWidth / 2;
    for(var i = 0; i < menuText.length; i++){
        var char = menuText.charAt(i);
        context.fillStyle = 'white';
        context.fillText(char,textX, textY);
        textX += context.measureText(char).width;
    }
}


var menuRow = 0;
var menuCol = 0;
var counter = 0;
function updateMenuGrid(){
    if(menuRow < activeGrid.length - 1){
        menuRow++;
    }else{
        menuRow = 0;
        if(menuCol < activeGrid[menuRow].length - 1){
            menuCol++;
        }else{
            menuCol = 0;
        }
    }
    activeGrid[menuRow][menuCol].clicked = true;
    counter++;
    if(counter > 100 || Math.random() < .02){
        counter = 0;
        activeGrid[menuCol][menuRow].type = TYPES.button;
        activeGrid[menuCol][menuRow].startValue = 2 + Math.round(Math.random() * 6);
        activeGrid[menuCol][menuRow].color = randomColor();
        activeGrid[menuCol][menuRow].clicked = false;
        console.log(menuCol, menuRow);
    }
}

function drawMenuButtons(){

}

function drawLevels(){

}

function drawTopBar(){
    context.fillStyle = '#000';
    context.fillRect(0,0,canvas.width,getTopBarHeight());
    var fontSize = Math.round(3 * getTopBarHeight() / 4);
    context.font='900 ' + fontSize + 'px Font Awesome\\ 5 Free';
    var drawX = canvas.width - 15;
    var margins = 15;
    BUTTONS.forEach(function(button, i){
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'right';
        var textBounds = context.measureText(button.text);
        var textX = drawX - margins * i;
        if(isMouseWithinBounds({width: textBounds.width, height: fontSize, x: textX - textBounds.width, y: getTopBarHeight() /2 - fontSize / 2})) {
            context.fillStyle = '#999';
            if(wasMouseClicked){
                wasMouseClicked = 0;
                button.onClick();
            }
        }
        context.fillText(button.text, textX, getTopBarHeight() / 2);
        drawX -= textBounds.width;
    });
}

function isMouseWithinBounds(bounds){
    var m = mousePos;
    if(m.x >= bounds.x && m.x <= bounds.x + bounds.width)
        if(m.y >= bounds.y && m.y <= bounds.y + bounds.height)
            return true;
    return false;
}

var GridSquare = function(startValue){
    this.startValue = startValue;
    this.type = startValue === 0 ? TYPES.empty : startValue > 0 ? TYPES.button : TYPES.target;
    this.shockWaves = [];
    this.getShockwaveValue = function(){
        var value = 0;
        this.shockWaves.forEach(function(wave){
            if(value === 0)
                value += wave.originalPower;
            else
                value *= wave.originalPower;
        });
        return value;
    };
    this.color = this.type === TYPES.button ? randomColor() : 'black';
    this.clicked = false;
};

var ShockWave = function(origin, originalPower, cyclesRemaining, color){
    this.originalPower = originalPower;
    this.origin = origin;
    this.cyclesRemaining = cyclesRemaining;
    this.color = color || randomColor();
    this.propagateTime = ROOM_SPEED / 2;
    this.canPropagate = true;
};


var allColors = ['maroon','red','purple','fuchsia','green','lime','olive','navy','blue','teal','aqua'];
var availableColors = [];
function randomColor(){
    if(availableColors.length === 0){
        allColors.forEach(function (color){
            availableColors.push(color);
        });
    }
    var index = Math.floor(Math.random() * availableColors.length);
    var color = availableColors[index];
    availableColors.splice(index, 1);
    return color;
}

function homeButtonClicked(){
    setScreen(SCREENS.menu);
}

function listButtonClicked(){
    setScreen(SCREENS.levels);
}

function restartButtonClicked(){
    initializeGrid(selectedGrid);
}

function initializeGrid(grid){
    var newGrid = [];
    for(var i = 0; i < grid.length; i++){
        newGrid[i] = [];
        for(var n = 0; n < grid[i].length; n++){
            newGrid[i][n] = new GridSquare(grid[i][n]);
        }
    }
    selectedGrid = grid;
    activeGrid = newGrid;
}

function mouseClicked(event){
    wasMouseClicked = 3;
    var mousePoint = getMousePoint(event);
    var mouseX = mousePoint.x;
    var mouseY = mousePoint.y;
    if(activeGrid){
        var squareWidth = Math.min(canvas.height-getTopBarHeight(), canvas.width) / activeGrid.length;
        var col = Math.floor(mouseX / squareWidth);
        var row = Math.floor((mouseY-getTopBarHeight()) / squareWidth);
        if(col >= 0 && row >= 0 && col < activeGrid.length && row < activeGrid[col].length)
        activeGrid[col][row].clicked = true;
    }
}

function getMousePoint(event){
    var pageY = event.pageY;
    var pageX = event.pageX;
    var rect = canvas.getBoundingClientRect();
    var canvasX = rect.left;
    var canvasY = rect.top;
    var mouseX = pageX - canvasX;
    var mouseY = pageY - canvasY;
    return new Point(mouseX, mouseY);
}

function drawGrid(){
    var grid = activeGrid;
    var squareSize = Math.min(canvas.height-getTopBarHeight(), canvas.width) / grid.length;
    var fontSize = squareSize / 3;
    context.textAlign = "center";
    context.textBaseline = "middle";
    for(var i = 0; i < grid.length; i++){
        for(var n = 0; n < grid[i].length; n++){
            var square = grid[i][n];
            var x = i * squareSize + squareSize / 2;
            var y = getTopBarHeight() + n * squareSize + squareSize / 2;
            square.shockWaves.forEach(function(wave, index){
                wave.propagateTime -= 1;
                wave.cyclesRemaining -= 1;
                if(wave.cyclesRemaining <= 0){
                    square.shockWaves.splice(index, 1);
                }else
                    if(wave.propagateTime <= 0 && wave.canPropagate) {
                        wave.canPropagate = false;
                        var origin = wave.origin;
                        var power = wave.originalPower;
                        var newCyclesRemaining = wave.cyclesRemaining - ROOM_SPEED + ROOM_SPEED / 2;
                        if (newCyclesRemaining > 0) {
                            var color = wave.color;
                            var neighbors = [];
                            if (i > 0)
                                neighbors.push(grid[i - 1][n]);
                            if (n > 0)
                                neighbors.push(grid[i][n - 1]);
                            if (i < grid.length - 1)
                                neighbors.push(grid[i + 1][n]);
                            if (n < grid[i].length - 1)
                                neighbors.push(grid[i][n + 1]);
                            neighbors.forEach(function (cell) {
                                if (cell.type !== TYPES.button) {
                                    var alreadyContainsColor = false;
                                    cell.shockWaves.forEach(function (cellShockWave) {
                                        if (cellShockWave.color === color)
                                            alreadyContainsColor = true;
                                    });
                                    if (!alreadyContainsColor) {
                                        cell.shockWaves.push(new ShockWave(origin, power, newCyclesRemaining, color));
                                        // cell.color = color;
                                        // cell.text = newCyclesRemaining;
                                    } else {
                                        // cell.text = 'fail';
                                    }
                                }
                            });
                        }
                    }
            });
            switch(square.type){
                case TYPES.button:
                    console.log('We have buttons');
                    if(square.clicked){
                        square.clicked = false;
                        square.shockWaves.push(new ShockWave(new Point(i, n), square.startValue,(square.startValue+1) * ROOM_SPEED, square.color));
                        square.type = TYPES.empty;
                        square.color = 'black';
                    }
                    context.fillStyle = square.color;
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                    context.fillStyle = 'white';
                    context.font = fontSize+'px' + ' Arial';
                    context.fillText(square.startValue,x,y);
                break;
                case TYPES.empty:
                    context.fillStyle = square.color;
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                    square.text = square.getShockwaveValue();
                    if(square.text){
                        context.fillStyle = 'white';
                        context.font = fontSize+'px' + ' Arial';
                        context.fillText(square.text,x,y);
                    }
                break;
                case TYPES.target:
                    context.fillStyle = 'black';
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                    context.fillStyle = 'white';
                    context.beginPath();
                    context.arc(x,y,squareSize/2-4,0,2*Math.PI);
                    context.fill();
                    context.fillStyle = 'black';
                    context.font = fontSize+'px' + ' Arial';
                    context.fillText(square.startValue,x,y);
                    if(square.getShockwaveValue() + square.startValue === 0){
                        square.type = TYPES.empty;
                    }
                break;
            }
            var maxAlpha = 0.5;
            if(square.shockWaves && square.shockWaves.length > 0) {
                var layerAlpha = maxAlpha / square.shockWaves.length;
                square.shockWaves.forEach(function (wave) {
                    context.globalAlpha = layerAlpha;
                    context.fillStyle = wave.color;
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                    context.globalAlpha = 1;
                });
            }
            context.strokeStyle = 'white';
            context.strokeRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
        }
    }
}