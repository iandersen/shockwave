var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var grids = [];
var ALL_UNLOCKED = false;
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

var hints = {
    1: 'Click the square to create a ShockRipple',
    2: 'A ShockRipple can destroy all targets with the same number',
    3: 'A ShockRipple will pass through targets with different numbers',
    4: 'When ShockRipples overlap, their power is multiplied',
    5: 'A ShockRipple will travel as many squares as its number',
    6: 'ShockRipples cannot pass through buttons that have not been pressed'
};

var unlocked = [];
unlocked[0] = 1;
var currentLevel = -1;

var currentScreen = SCREENS.menu;
var ROOM_SPEED = 30;
var wasMouseClicked = 0;

var TopBarButton = function (text, callback) {
    this.text = text;
    this.onClick = callback
};

var Point = function (x, y) {
    this.x = x;
    this.y = y;
};

var mousePos = new Point(0, 0);

var TOP_BAR_BUTTONS = [
    new TopBarButton('\uf021', restartButtonClicked),
    new TopBarButton('\uf03a', listButtonClicked),
    new TopBarButton('\uF015', homeButtonClicked)
];

// window.onload = loadGrids;
document.fonts.ready.then(loadGrids);
var activeGrid = null;
var selectedGrid = null;

function loadGrids() {
    $.getJSON('./grids.json', function (json) {
        grids = json;
        start();
    });
}

canvas.addEventListener('click', mouseClicked);
window.addEventListener('keydown', keyPressed);
canvas.addEventListener('mousemove', mouseMoved);

function mouseMoved(event) {
    mousePos = getMousePoint(event);
}


var url = (window.location !== window.parent.location)
    ? document.referrer
    : document.location.href;
console.log('Being accessed from ', url);

// $.post('https://htmlhigh5.com/remotePlay', {url: url, game: 'shockripple'});

function start() {
    draw();
}

function setScreen(screen) {
    currentScreen = screen;
    if(screen !== SCREENS.game)
        currentLevel = -1;
    if (currentScreen === SCREENS.menu)
        $('#htmlhigh5Box').show();
    else
        $('#htmlhigh5Box').hide();
}

function draw() {
    var size = Math.min(window.innerHeight, window.innerWidth);
    canvas.height = size;
    canvas.width = size * canvas.height / (canvas.height + getTopBarHeight());
    context.height = canvas.height;
    context.width = canvas.width;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch (currentScreen) {
        case SCREENS.menu:
            drawMenu();
            if (wasMouseClicked) {
                setScreen(SCREENS.levels);
                wasMouseClicked = 0;
            }
        break;
        case SCREENS.levels:
            drawLevels();
        break;
        case SCREENS.game:
            drawTopBar();
            if (activeGrid)
                drawGrid();
            drawHint();
        break;
        default:
            console.log('Unknown screen: ', currentScreen);
        break;
    }
    setTimeout(draw, 1000 / ROOM_SPEED);
    if (wasMouseClicked)
        wasMouseClicked -= 1;
}

function getTopBarHeight() {
    if (currentScreen === SCREENS.game)
        return canvas.height / 15;
    return 0;
}

var menuGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawMenu() {
    if (!selectedGrid || selectedGrid.length !== menuGrid.length)
        initializeGrid(menuGrid);
    updateMenuGrid();
    drawGrid();
    context.globalAlpha = .6;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    drawLogo();
    drawMenuButtons();
}

var menuColors = [];

function drawLogo() {
    var menuText = 'ShockRipple';
    var fontSize = Math.round(canvas.width / 10);
    while (menuColors.length < menuText.length)
        menuColors.push(randomColor());
    context.font = fontSize + 'px Arial';
    context.textBaseline = 'top';
    context.textAlign = 'left';
    var totalWidth = context.measureText(menuText).width;
    var textY = Math.round(canvas.width / 25);
    var textX = canvas.width / 2 - totalWidth / 2;
    for (var i = 0; i < menuText.length; i++) {
        var char = menuText.charAt(i);
        context.fillStyle = '#888';
        context.fillText(char, textX, textY);
        textX += context.measureText(char).width;
    }
}


var menuRow = 0;
var menuCol = 0;
var counter = 0;

function updateMenuGrid() {
    if (menuRow < activeGrid.length - 1) {
        menuRow++;
    } else {
        menuRow = 0;
        if (menuCol < activeGrid[menuRow].length - 1) {
            menuCol++;
        } else {
            menuCol = 0;
        }
    }
    counter++;
    if (activeGrid && activeGrid[menuRow] && activeGrid[menuRow][menuCol]) {
        activeGrid[menuRow][menuCol].clicked = true;
        if (counter > 50 || Math.random() < .04) {
            counter = 0;
            activeGrid[menuCol][menuRow].type = TYPES.button;
            activeGrid[menuCol][menuRow].startValue = 2 + Math.round(Math.random() * 6);
            activeGrid[menuCol][menuRow].color = randomColor();
            activeGrid[menuCol][menuRow].clicked = false;
        }
    }
}

function drawMenuButtons() {
    var fontSize = Math.round(canvas.width / 20);
    context.font = fontSize + 'px Arial';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.fillText('Press Anywhere to Begin!', canvas.width / 2, canvas.height / 2);
}

var page = 0;
var levelMenuRows = 4;
var levelMenuCols = 5;
var levelMenuColors = [];

function drawLevels() {
    if (!selectedGrid || selectedGrid.length !== menuGrid.length)
        initializeGrid(menuGrid);
    updateMenuGrid();
    drawGrid();
    context.globalAlpha = .6;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    for (var n = 0; n < grids.length; n++) {
        if (!levelMenuColors[n])
            levelMenuColors[n] = randomColor();
    }
    var rows = levelMenuRows;
    var cols = levelMenuCols;
    var padding = canvas.width / 8;
    var boxSize = canvas.width / 8;
    var totalWidth = boxSize * cols;
    var totalHeight = boxSize * rows;
    var xMargins = (canvas.width - padding * 2 - totalWidth) / (cols - 1);
    var yMargins = (canvas.height - padding * 2 - totalHeight) / (rows - 1);
    var x = padding;
    var y = padding;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    for (var i = page * rows * cols; i < (page + 1) * rows * cols && i < grids.length; i++) {
        context.fillStyle = '#333';
        var canClick = unlocked[i] || ALL_UNLOCKED;
        if(canClick)
            context.fillStyle = levelMenuColors[i];
        context.fillRect(x, y, boxSize, boxSize);
        if (canClick && isMouseWithinBounds({x: x, y: y, width: boxSize, height: boxSize})) {
            context.fillStyle = 'black';
            context.globalAlpha = .8;
            context.fillRect(x, y, boxSize, boxSize);
            context.globalAlpha = 1;
            if (wasMouseClicked) {
                wasMouseClicked = 0;
                currentLevel = i+1;
                initializeGrid(grids[i]);
                setScreen(SCREENS.game);
            }
        }
        context.fillStyle = 'white';
        context.font = Math.round(boxSize / 2) + 'px Arial';
        context.fillText(i + 1, x + boxSize / 2, y + boxSize / 2);
        x += xMargins + boxSize;
        if (i > 0 && (i + 1) % cols === 0) {
            x = padding;
            y += yMargins + boxSize;
        }
    }
    drawArrows();
}

function drawArrows() {
    var leftArrow = '\uf060';
    var rightArrow = '\uf061';
    var color = '#fff';
    var hoverColor = '#999';
    var fontSize = Math.round(canvas.width / 15);
    context.font = '900 ' + fontSize + 'px Font Awesome\\ 5 Free';
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    var width = context.measureText(leftArrow).width;
    var spacing = canvas.width / 10;
    var bottomPadding = canvas.height / 25;
    var x, y, mouseOver;
    if (page > 0) {
        x = canvas.width / 2 - width - spacing / 2;
        y = canvas.height - bottomPadding;
        mouseOver = isMouseWithinBounds({x: x, y: canvas.height - bottomPadding - width, width: width, height: width});
        context.fillStyle = color;
        if (mouseOver) {
            context.fillStyle = hoverColor;
            if (wasMouseClicked) {
                wasMouseClicked = 0;
                page--;
            }
        }
        context.fillText(leftArrow, x, y);
    }
    if (page + 1 < grids.length / (levelMenuCols * levelMenuRows)) {
        x = canvas.width / 2 + spacing / 2;
        y = canvas.height - bottomPadding;
        mouseOver = isMouseWithinBounds({x: x, y: canvas.height - bottomPadding - width, width: width, height: width});
        context.fillStyle = color;
        if (mouseOver) {
            context.fillStyle = hoverColor;
            if (wasMouseClicked) {
                wasMouseClicked = 0;
                page++;
            }
        }
        context.fillText(rightArrow, x, y);
    }
}

function drawTopBar() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, getTopBarHeight());
    var fontSize = Math.round(3 * getTopBarHeight() / 4);
    context.font = '900 ' + fontSize + 'px Font Awesome\\ 5 Free';
    var drawX = canvas.width - 15;
    var margins = 15;
    TOP_BAR_BUTTONS.forEach(function (button, i) {
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'right';
        var textBounds = context.measureText(button.text);
        var textX = drawX - margins * i;
        if (isMouseWithinBounds({
                width: textBounds.width,
                height: fontSize,
                x: textX - textBounds.width,
                y: getTopBarHeight() / 2 - fontSize / 2
            })) {
            context.fillStyle = '#999';
            if (wasMouseClicked) {
                wasMouseClicked = 0;
                button.onClick();
            }
        }
        context.fillText(button.text, textX, getTopBarHeight() / 2);
        drawX -= textBounds.width;
    });
}

function isMouseWithinBounds(bounds) {
    var m = mousePos;
    if (m.x >= bounds.x && m.x <= bounds.x + bounds.width)
        if (m.y >= bounds.y && m.y <= bounds.y + bounds.height)
            return true;
    return false;
}

var GridSquare = function (startValue) {
    this.startValue = startValue;
    this.type = startValue === 0 ? TYPES.empty : startValue > 0 ? TYPES.button : TYPES.target;
    this.shockWaves = [];
    this.getShockwaveValue = function () {
        var value = 0;
        this.shockWaves.forEach(function (wave) {
            if (value === 0)
                value += wave.originalPower;
            else
                value *= wave.originalPower;
        });
        return value;
    };
    this.color = this.type === TYPES.button ? randomColor() : 'black';
    this.clicked = false;
};

var ShockWave = function (origin, originalPower, cyclesRemaining, color) {
    this.originalPower = originalPower;
    this.origin = origin;
    this.cyclesRemaining = cyclesRemaining;
    this.color = color || randomColor();
    this.propagateTime = ROOM_SPEED / 2;
    this.canPropagate = true;
};


var allColors = ['maroon', 'red', 'purple', 'fuchsia', 'green', 'lime', 'olive', 'navy', 'blue', 'teal', 'aqua'];
var availableColors = [];

function randomColor() {
    if (availableColors.length === 0) {
        allColors.forEach(function (color) {
            availableColors.push(color);
        });
    }
    var index = Math.floor(Math.random() * availableColors.length);
    var color = availableColors[index];
    availableColors.splice(index, 1);
    return color;
}

function resetColors() {
    availableColors = [];
}

function homeButtonClicked() {
    setScreen(SCREENS.menu);
}

function listButtonClicked() {
    setScreen(SCREENS.levels);
}

function restartButtonClicked() {
    initializeGrid(selectedGrid);
}

function initializeGrid(grid) {
    resetColors();
    var newGrid = [];
    for (var i = 0; i < grid.length; i++) {
        newGrid[i] = [];
        for (var n = 0; n < grid[i].length; n++) {
            newGrid[i][n] = new GridSquare(grid[i][n]);
        }
    }
    selectedGrid = grid;
    activeGrid = newGrid;
}

function mouseClicked(event) {
    wasMouseClicked = 3;
    var mousePoint = getMousePoint(event);
    var mouseX = mousePoint.x;
    var mouseY = mousePoint.y;
    if (activeGrid) {
        var squareWidth = Math.min(canvas.height - getTopBarHeight(), canvas.width) / activeGrid.length;
        var col = Math.floor(mouseX / squareWidth);
        var row = Math.floor((mouseY - getTopBarHeight()) / squareWidth);
        if (col >= 0 && row >= 0 && col < activeGrid.length && row < activeGrid[col].length)
            activeGrid[col][row].clicked = true;
    }
}

function keyPressed(event) {
    if (currentScreen === SCREENS.menu)
        setScreen(SCREENS.levels);
}

function getMousePoint(event) {
    var pageY = event.pageY;
    var pageX = event.pageX;
    var rect = canvas.getBoundingClientRect();
    var canvasX = rect.left;
    var canvasY = rect.top;
    var mouseX = pageX - canvasX;
    var mouseY = pageY - canvasY;
    return new Point(mouseX, mouseY);
}

function drawHint(){
    if(hints[currentLevel]){
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = canvas.width/35+'px Arial';
        var width = context.measureText(hints[currentLevel]).width;
        var y = getTopBarHeight() + canvas.height / 50;
        var margins = 5;
        context.globalAlpha = .8;
        context.fillStyle = 'black';
        context.fillRect(canvas.width/2 - width/2-margins/2, getTopBarHeight(), width+margins/2,canvas.width/16.5);
        context.globalAlpha = 1;
        context.fillStyle = '#aaa';
        context.fillText(hints[currentLevel], canvas.width/2, y);
    }
}

function drawGrid() {
    var grid = activeGrid;
    var squareSize = Math.min(canvas.height - getTopBarHeight(), canvas.width) / grid.length;
    var fontSize = squareSize / 3;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    var containsTargets = false;
    for (var i = 0; i < grid.length; i++) {
        for (var n = 0; n < grid[i].length; n++) {
            var square = grid[i][n];
            var x = i * squareSize + squareSize / 2;
            var y = getTopBarHeight() + n * squareSize + squareSize / 2;
            square.shockWaves.forEach(function (wave, index) {
                wave.propagateTime -= 1;
                wave.cyclesRemaining -= 1;
                if (wave.cyclesRemaining <= 0) {
                    square.shockWaves.splice(index, 1);
                } else if (wave.propagateTime <= 0 && wave.canPropagate) {
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
            switch (square.type) {
                case TYPES.button:
                    if (square.clicked) {
                        square.clicked = false;
                        square.shockWaves.push(new ShockWave(new Point(i, n), square.startValue, (square.startValue + 1) * ROOM_SPEED, square.color));
                        square.type = TYPES.empty;
                        square.color = 'black';
                    }
                    context.fillStyle = square.color;
                    context.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
                    context.fillStyle = 'white';
                    context.font = fontSize + 'px' + ' Arial';
                    context.fillText(square.startValue, x, y);
                    break;
                case TYPES.empty:
                    context.fillStyle = square.color;
                    context.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
                    square.text = square.getShockwaveValue();
                    if (square.text) {
                        context.fillStyle = 'white';
                        context.font = fontSize + 'px' + ' Arial';
                        context.fillText(square.text, x, y);
                    }
                    break;
                case TYPES.target:
                    containsTargets = true;
                    context.fillStyle = 'black';
                    context.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
                    context.fillStyle = 'white';
                    context.beginPath();
                    context.arc(x, y, squareSize / 2 - 4, 0, 2 * Math.PI);
                    context.fill();
                    context.fillStyle = 'black';
                    context.font = fontSize + 'px' + ' Arial';
                    context.fillText(square.startValue, x, y);
                    if (square.getShockwaveValue() + square.startValue === 0) {
                        square.type = TYPES.empty;
                    }
                    break;
            }
            var maxAlpha = 0.5;
            if (square.shockWaves && square.shockWaves.length > 0) {
                var layerAlpha = maxAlpha / square.shockWaves.length;
                square.shockWaves.forEach(function (wave) {
                    context.globalAlpha = layerAlpha;
                    context.fillStyle = wave.color;
                    context.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
                    context.globalAlpha = 1;
                });
            }
            context.strokeStyle = 'white';
            context.strokeRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
        }
    }
    if(!containsTargets && currentLevel !== -1){
        unlocked[currentLevel] = true;
    }
}