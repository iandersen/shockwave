var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var grids = [];
var TYPES = {
    empty: 0,
    button: 1,
    target: 2
};
var ROOM_SPEED = 30;

loadGrids();
var activeGrid = null;

function loadGrids() {
    $.getJSON('./grids.json', function(json){
        grids = json;
        start();
    });
}

canvas.addEventListener('click', mouseClicked);


var url = (window.location !== window.parent.location)
    ? document.referrer
    : document.location.href;
console.log('Being accessed from ', url);
// $.post('https://htmlhigh5.com/remotePlay', {url: url, game: 'shockripple'});

function start(){
    initializeGrid(grids[1]);
    draw();
}

function draw(){
    if(activeGrid) {
        var size = Math.min(window.innerHeight, window.innerWidth);
        canvas.height = size;
        canvas.width = size;
        context.height = canvas.height;
        context.width = canvas.width;
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(activeGrid);
        setTimeout(draw,1000/ROOM_SPEED);
    }
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
    console.log('cycles remaining: ', cyclesRemaining);
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

var Point = function(x,y){
    this.x = x;
    this.y = y;
};

function initializeGrid(grid){
    for(var i = 0; i < grid.length; i++){
        for(var n = 0; n < grid[i].length; n++){
            grid[i][n] = new GridSquare(grid[i][n]);
        }
    }
    activeGrid = grid;
}

function mouseClicked(event){
    var pageY = event.pageY;
    var pageX = event.pageX;
    var rect = canvas.getBoundingClientRect();
    var canvasX = rect.left;
    var canvasY = rect.top;
    var mouseX = pageX - canvasX;
    var mouseY = pageY - canvasY;
    if(activeGrid){
        var squareWidth = Math.floor(Math.min(canvas.height, canvas.width) / activeGrid.length);
        var col = Math.floor(mouseX / squareWidth);
        var row = Math.floor(mouseY / squareWidth);
        activeGrid[col][row].clicked = true;
    }
}

function drawGrid(grid){
    var squareSize = Math.floor(Math.min(canvas.height, canvas.width) / grid.length);
    var fontSize = squareSize / 2;
    context.textAlign = "center";
    context.textBaseline = "middle";
    var leftX = (canvas.width - squareSize * grid.length) / 2;
    var topY = (canvas.height - squareSize * grid.length) / 2;
    topY = 0;
    leftX = 0;
    for(var i = 0; i < grid.length; i++){
        for(var n = 0; n < grid[i].length; n++){
            var square = grid[i][n];
            var x = leftX + i * squareSize + squareSize / 2;
            var y = topY + n * squareSize + squareSize / 2;
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