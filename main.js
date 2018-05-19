var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var grids = [];
var TYPES = {
    empty: 0,
    button: 1,
    target: 2
};

loadGrids();

function loadGrids() {
    $.getJSON('./grids.json', function(json){
        grids = json;
        start();
    });
}

var url = (window.location !== window.parent.location)
    ? document.referrer
    : document.location.href;
console.log('Being accessed from ', url);
// $.post('https://htmlhigh5.com/remotePlay', {url: url, game: 'shockripple'});

function start(){
    draw();
}

function draw(){
    console.log('drawing');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    context.height = canvas.height;
    context.width = canvas.width;
    context.clearRect(0,0,canvas.width,canvas.height);
    initializeGrid(grids[2]);
    drawGrid(grids[2]);
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
};

var ShockWave = function(origin, originalPower, cyclesRemaining, color){
    this.originalPower = originalPower;
    this.origin = origin;
    this.cyclesRemaining = cyclesRemaining;
    this.color = color || randomColor();
};


var allColors = ['red','green','yellow','blue','magenta'];
var availableColors = [];
function randomColor(){
    console.log(availableColors);
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
}

function drawGrid(grid){
    var squareSize = Math.floor(Math.min(canvas.height, canvas.width) / grid.length);
    var fontSize = squareSize / 2;
    console.log('font size: ', fontSize);
    context.textAlign = "center";
    context.textBaseline = "middle";
    var leftX = (canvas.width - squareSize * grid.length) / 2;
    var topY = (canvas.height - squareSize * grid.length) / 2;
    for(var i = 0; i < grid.length; i++){
        for(var n = 0; n < grid[i].length; n++){
            var square = grid[i][n];
            var x = leftX + i * squareSize + squareSize / 2;
            var y = topY + n * squareSize + squareSize / 2;
            switch(square.type){
                case TYPES.button:
                    context.fillStyle = square.color;
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                    context.fillStyle = 'white';
                    context.font = fontSize+'px' + ' Arial';
                    context.fillText(square.startValue,x,y);
                break;
                case TYPES.empty:
                    context.fillStyle = square.color;
                    context.fillRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
                break;
                case TYPES.target: break;
            }
            context.strokeStyle = 'white';
            context.strokeRect(x-squareSize/2,y-squareSize/2,squareSize,squareSize);
        }
    }
}