var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var grids = [];

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
    context.clearRect(0,0,canvas.width,canvas.height);
    drawGrid(grids[2]);
}

function drawGrid(grid){
    for(var i = 0; i < grid.length; i++){
        for(var n = 0; n < grid[i].length; n++){

        }
    }
}