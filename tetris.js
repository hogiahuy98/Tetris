const canvas  = document.getElementById('tetris');
const context = canvas.getContext('2d');
const width   = canvas.width;
const height  = canvas.height;
const sqsize  = 30;
const numrow  = height / sqsize;
const numcol  = width  / sqsize;
const bricks_list = [L,I,T,J,O,S,Z];



var board = []


function createBoard(){
    for (let i = 0; i < numcol; i++){
        board.push([]);
        for (let j = 0; j < numrow; j++)
            board[i].push(0);
    }
}

function resetBoard(){
    for (let i = 0; i < numcol; i++){
        for (let j = 0; j < numrow; j++)
            board[i][j] = 0;
    }
}

function drawGrid() {
    for(var i = 0; i < numcol; i++){
        context.moveTo(i * sqsize, 0);
        context.lineTo(i * sqsize, height);
    }
    for(var i = 0; i < numrow; i++){
        context.moveTo(0, i * sqsize);
        context.lineTo(width, i * sqsize);
    }
    context.stroke()
}


function updateBoard(now){

    for(let r = now; r > 0; r--){
        for(let c = 0; c < numcol; c++){
            if(board[c][r]==1){
                drawSquare(c, r);
            }
            else unDrawSquare(c, r);
        }
    }
}


function drawSquare(x, y){

    context.fillStyle = "black";
    context.fillRect(sqsize*x+1, sqsize*y+1, sqsize-2, sqsize-2);
}


function unDrawSquare(x, y){

    context.fillStyle = "white";
    context.fillRect(sqsize * x + 1, sqsize * y + 1, sqsize - 2, sqsize - 2)
}


function Brick(){
    this.speed = 750;
    this.run;
    this.brick_shape = bricks_list[Math.floor(Math.random() * 7)];
    this.brick_state = 0;
    this.brick       = this.brick_shape[this.brick_state];
    this.x = 3;
    this.y = -2;
    this.ispause = true;
    this.count_deleted_line = 0;
}


Brick.prototype.drawBrick = function (){
    for (var Y = 0; Y < this.brick.length; Y++)
        for (var X = 0; X < this.brick.length; X++) if (this.brick[Y][X] == 1)
        
            drawSquare(this.x + X, this.y + Y);
//end function
}


Brick.prototype.unDrawBrick = function (){
    for(var Y = 0; Y < this.brick.length; Y++)
        for(var X = 0; X < this.brick.length; X++) if(this.brick[Y][X] == 1)
            
            unDrawSquare(this.x + X, this.y + Y);
//end function
}


Brick.prototype.checkMovable = function(X, Y, new_brick){
    for (let row = 0; row < this.brick.length; row++){
        for (let col = 0; col < this.brick.length; col++){

            if(new_brick[row][col] == 0)
                continue;

            let newX = this.x + col + X;
            let newY = this.y + row + Y;
            if ((newX < 0 || newX >= numcol || newY  >= numrow))
                return false;
            if (board[newX][newY] == 1 && new_brick[row][col] == 1)
                return false;
        }
    }

    return true;
}


Brick.prototype.lockBrick = function(){
    for (var row = 0; row < this.brick.length; row++){
        for (var col = 0; col < this.brick.length; col++){
            if(this.brick[row][col] == 1)
            board[col + this.x][row + this.y] = 1;
        }
    }
    if(this.checkGameOver()){
        clearInterval(this.run);
        document.getElementById('gameover').style.visibility="visible";
        document.getElementById('play_again').style.visibility="visible";
        document.getElementById("pause_button").style.visibility = "hidden";

    }
    this.deleteFullRow();
    this.newBrick();
}


Brick.prototype.checkGameOver = function(){

    for(c = 0; c < numcol; c++)
        if(board[c][0] == 1)
            return true;
}


Brick.prototype.newBrick = function(){

    let new_brick_index = Math.floor(Math.random() * 7);
    this.x = 4;
    this.y = -2;
    this.brick_shape = bricks_list[new_brick_index];
    this.brick_state = 0;
    this.brick = this.brick_shape[this.brick_state];
}


Brick.prototype.deleteFullRow = function(){  
    var line_count = 0;
    for(let r = numrow - 1; r > 0; r--){
        var isFull = true;        
        for (let c = 0; c < numcol; c++){          
            if(board[c][r] == 0){
                isFull = false;
                break;
            }
        }       
        if(isFull){
            line_count++;
            for(let r1 = r; r1 > 1; r1--)
                for (let c = 0; c < numcol; c++){   

                    board[c][r1] = board[c][r1 - 1];
                }
            r++;
        }
        updateBoard(r);
    }
    if(line_count!=0){
        this.updateScore(line_count);
        this.count_deleted_line += line_count;
        if(this.count_deleted_line > 5 && this.speed > 250){
            this.increaseSpeed();
            this.count_deleted_line = 0;
        }
    }
}


Brick.prototype.updateScore = function(line){
    score = Math.pow(line, 2);
    document.getElementById('score').innerHTML = parseInt(document.getElementById('score').textContent) + score;
}


Brick.prototype.quickDrop = function(){
    this.unDrawBrick();
    while(this.checkMovable(0, 1, this.brick)){
        this.y++;
    }
    this.drawBrick();
    this.lockBrick();
}


Brick.prototype.moveDown = function (){
    if(this.checkMovable(0, 1,this.brick)){
        this.unDrawBrick();
        this.y++;
        this.drawBrick();
    }
    else{
        this.lockBrick();
    }
}


Brick.prototype.moveLeft = function(){
    if(this.checkMovable(-1,0,this.brick)){
        this.unDrawBrick();
        this.x--;
        this.drawBrick();
    }
}


Brick.prototype.moveRight = function(){

    if(this.checkMovable(1,0,this.brick)){
        this.unDrawBrick();
        this.x++;
        this.drawBrick();
    }
}


Brick.prototype.rolate = function(){
    let new_state = (this.brick_state + 1) % this.brick_shape.length;
    if (this.checkMovable(0, 0, this.brick_shape[new_state])){
        this.unDrawBrick();
        this.brick_state = new_state
        this.brick       = this.brick_shape[this.brick_state];
        this.drawBrick();
    }
}


Brick.prototype.runGame = function(){
    this.ispause = false;
    this.run = setInterval(function(){brick.moveDown()}, this.speed);
    document.getElementById("pause_button").style.visibility = "visible";
}


Brick.prototype.increaseSpeed = function(){
    clearInterval(this.run);
    this.speed = this.speed - 25;
    this.runGame();
}


Brick.prototype.pauseGame = function(){
    clearInterval(this.run);
    document.getElementById("pause_button").style.visibility = "hidden";
    document.getElementById("resume_button").style.visibility = "visible";
    this.ispause = true;
}


Brick.prototype.resumeGame = function(){
    this.runGame();
    document.getElementById("pause_button").style.visibility = "visible";
    document.getElementById("resume_button").style.visibility = "hidden";
    this.ispause = false;
}


drawGrid();
var brick = new Brick();
document.getElementById("start_button").style.visibility = "visible";

function startGame() {
    createBoard();
    brick.drawBrick();
    brick.runGame();
    document.getElementById("start_button").style.visibility = "hidden";
    document.getElementById("score").style.visibility = "visible";
    document.getElementById("your_score").style.visibility = "visible";
}

function playAgain(){
    location.reload();
}

document.addEventListener('keyup', (k) => {
    if(!brick.ispause){
        if      (k.code === 'ArrowDown')  brick.moveDown() ;
        else if (k.code === 'ArrowLeft')  brick.moveLeft() ;
        else if (k.code === 'ArrowRight') brick.moveRight();
        else if (k.code === 'ArrowUp')    brick.rolate()   ;
        else if (k.code === 'Space')      brick.quickDrop();
    }
});