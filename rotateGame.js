//--------------------ROTATING GAME--------------------------------------------
//   By HarryBP
//
//  TODO:
//    - make the gap shrink the more balls are in the square
//    - Rewrite update method
//
      var gameSize = 512;
      createCanvas();
      init();
//
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
//  Rotate all the corners of the square around its center by angle theta
function rotateSquare(theta){
  for(var c in square.corners){
    square.corners[c] = rotate(square.corners[c], theta);
  }
  for(var c in square.innerCorners){
    square.innerCorners[c] = rotate(square.innerCorners[c], theta);
  }
}

//-----------------------------------------------------------------------------
//  Rotate a single point around the center of the square by angle theta
//  Returns the rotated point
function rotate(point, theta){
  var tempX = point.x - gameSize/2;
  var tempY = point.y - gameSize/2;
  var rotX = (tempX * Math.cos(theta)) - (tempY * Math.sin(theta));
  var rotY = (tempX * Math.sin(theta)) + (tempY * Math.cos(theta));
  point.x = rotX + gameSize/2;
  point.y = rotY + gameSize/2;
  return point;
}

//-----------------------------------------------------------------------------
//  Adds a new ball to the game at position 'pos' travelling towards the center
function addBall(pos){
  var ball = {
    position: { x: pos.x, y: pos.y },
    speed: { x: (gameSize/2 - pos.x) / 64, y: (gameSize/2 - pos.y) / 64 },
    radius: gameSize/64,
    colour: "#000",
    dead: false,
    active: false
  }
  return ball;
}

//-----------------------------------------------------------------------------
//  Adds four new balls to the game on each side 
function newLevel(){
  balls.push(addBall({x: gameSize/2, y: 0}));
  balls.push(addBall({x: gameSize/2, y: gameSize}));
  balls.push(addBall({x: 0, y: gameSize/2}));
  balls.push(addBall({x: gameSize, y: gameSize/2}));
}

//-----------------------------------------------------------------------------
//  Creates game canvas of given size and adds to body
function createCanvas(){
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = gameSize;
  canvas.height = gameSize;
  canvas.style.cssText += "display:block; margin: auto; width: " + gameSize + "px; height: " + gameSize + "px;";
  document.body.insertBefore(canvas, document.body.firstChild);
}

//-----------------------------------------------------------------------------
//  Declares and initialises all variables needed for the game
//  This includes the square object representing the game space
function initialiseVariables(){
  frameLength = 25;
  paused = dead = false;
  rotateSpeed = 0.02;
  score = levelscore = direction = 0;
  radius = gameSize/64;
  balls = [];

  //Game space
  square = {
    corners: [
      { x: 2*gameSize/8, y: 2*gameSize/8 },
      { x: 6*gameSize/8, y: 2*gameSize/8 },
      { x: 6*gameSize/8, y: 6*gameSize/8 },
      { x: 2*gameSize/8, y: 6*gameSize/8 }
    ],
    innerCorners: [
      { x: 2*gameSize/8 + radius, y: 2*gameSize/8 + radius },
      { x: 6*gameSize/8 - radius, y: 2*gameSize/8 + radius },
      { x: 6*gameSize/8 - radius, y: 6*gameSize/8 - radius },
      { x: 2*gameSize/8 + radius, y: 6*gameSize/8 - radius }
    ],
    color: "#FFF"
  }
}

//-----------------------------------------------------------------------------
//  Called to start a new game
function init(){
  initialiseVariables();
  newLevel();
}

//-----------------------------------------------------------------------------
//  Check if ball is in the box
//  Returns true if the ball is within the inner-box
//  Returns false if the ball is outside / has touched the edge
function check(ball){
  var area1 = areaTriangle(square.innerCorners[0], ball.position, square.innerCorners[3]);
  var area2 = areaTriangle(square.innerCorners[2], ball.position, square.innerCorners[3]);
  var area3 = areaTriangle(square.innerCorners[2], ball.position, square.innerCorners[1]);
  var area4 = areaTriangle(ball.position, square.innerCorners[1], square.innerCorners[0]);
  var areaSq = Math.pow((gameSize/2 - 2*ball.radius),2);
  return(Math.round(area1 + area2 + area3 + area4) <= areaSq);
}

//-----------------------------------------------------------------------------
//  Returns the area of a triangle given its 3 corners
function areaTriangle(a,b,c){
  var p1 = a.x * (b.y - c.y);
  var p2 = b.x * (c.y - a.y);
  var p3 = c.x * (a.y - b.y);
  return Math.abs((p1+p2+p3)/2);
}

//-----------------------------------------------------------------------------
//  Returns the distance between two points
function dist(a,b){
  return(Math.sqrt(Math.pow(b.x-a.x,2) + Math.pow(b.y-a.y,2)));
}

//-----------------------------------------------------------------------------
//  Update all entities every frame
//  This needs rewriting so it makes sense
function update(){
  //if(active)
    rotateSquare(direction * rotateSpeed);

  if(levelscore >= 64){
    levelscore-=64;
    newLevel();
  }
  

  for(var i in balls){
    var ball = balls[i];

    //Moveball
    ball.position.x += ball.speed.x;
    ball.position.y += ball.speed.y;

    if(!check(ball) && !ball.dead){ //If wall hit

      //Find closest vertices
      var distances = [];
      for(var x in square.innerCorners){
        var distanceInfo = {
          corner: square.innerCorners[x],
          distance: dist(square.innerCorners[x], ball.position)
        };
        distances.push(distanceInfo);
      }
      distances.sort(function(a,b){
        return a.distance - b.distance;
      });

      if(!ball.active){
      } else if(distances[0].distance >= 3*gameSize/16){ //Hit gap
        ball.dead = true;
        document.getElementById('info').innerHTML = 'Dead';

      } else if(distances[1].distance == distances[2].distance) { //Hit corner
          ball.speed.x = - ball.speed.x;
          ball.speed.y = - ball.speed.y;
          score ++;
          levelscore++;

      } else { //Hit wall
        score ++;
        levelscore++;

        //Get speed
        var vector = { x: gameSize/2 - ball.position.x, y: gameSize/2 - ball.position.y }
        ball.position.x += vector.x/gameSize*16;
        ball.position.y += vector.y/gameSize*16;

        //Find vector of line 
        var lX = Math.max(distances[0].corner.x,distances[1].corner.x) - Math.min(distances[0].corner.x,distances[1].corner.x);
        var lY = Math.max(distances[0].corner.y,distances[1].corner.y) - Math.min(distances[0].corner.y,distances[1].corner.y);
        //Find normal vector of line
        var midX = Math.min(distances[0].corner.x,distances[1].corner.x) + (lX/2);
        var midY = Math.min(distances[0].corner.y,distances[1].corner.y) + (lY/2);
        var normalX = gameSize/2 - midX;
        var normalY = gameSize/2 - midY;
        //Find bounce vector
        var normalMag = Math.sqrt(Math.pow(normalX,2) + Math.pow(normalY,2));
        var unitNormalX = normalX / normalMag;
        var unitNormalY = normalY / normalMag;
        var dotProd = (unitNormalX *  ball.speed.x) + (unitNormalY *  ball.speed.y);
        var rhsX = 2 * dotProd * unitNormalX;
        var rhsY = 2 * dotProd * unitNormalY;
        ball.speed.x =  ball.speed.x - rhsX;
        ball.speed.y =  ball.speed.y - rhsY;

        if(direction != 0){
          var speed = Math.abs(rotateSpeed * direction * dist(ball.position, {x: gameSize/2, y: gameSize/2}));
          tangent = { x: vector.y * direction, y: -vector.x * direction }
          var tangentMagnitude = Math.sqrt(Math.pow(tangent.x,2) + Math.pow(tangent.y,2));
          var unitTangent = { x: tangent.x / tangentMagnitude, y: tangent.y / tangentMagnitude };
          tangent = { x: unitTangent.x * speed, y: unitTangent.y * speed }
          ball.speed.x += tangent.x/2;
          ball.speed.y += tangent.y/2;
        }
      }
    } else {
      ball.active = true;
    }
  }

  draw();
}

//-----------------------------------------------------------------------------
//  Paints a frame to the canvas
function draw(){
  document.getElementById('info').innerHTML = score;
  ctx.clearRect(0,0,gameSize,gameSize);

  //Color Square
  var color = 186;
  for(x = 0; x < Math.floor(score/64)+1; x++){
    ctx.fillStyle = "#74" + (186 - (x* 16)).toString(16) + "62";
    var percentage = 1 + x - (score/64) ;
    ctx.beginPath();
    ctx.moveTo(square.corners[0].x + ((gameSize/2 - square.corners[0].x) * percentage), square.corners[0].y + ((gameSize/2  - square.corners[0].y) * percentage));
    ctx.lineTo(square.corners[1].x + ((gameSize/2 - square.corners[1].x) * percentage), square.corners[1].y + ((gameSize/2  - square.corners[1].y) * percentage));
    ctx.lineTo(square.corners[2].x + ((gameSize/2 - square.corners[2].x) * percentage), square.corners[2].y + ((gameSize/2  - square.corners[2].y) * percentage));
    ctx.lineTo(square.corners[3].x + ((gameSize/2 - square.corners[3].x) * percentage), square.corners[3].y + ((gameSize/2  - square.corners[3].y) * percentage));
    ctx.closePath();
    ctx.fill();
  }

  //Draw square
  ctx.strokeStyle = "black";
  ctx.lineWidth=gameSize/128;
  var prev = 3;
  for(var x = 0; x < square.corners.length; x++){
    drawLine(square.corners[prev], square.corners[x]);
    drawLine(square.corners[x], square.corners[prev]);
    prev = x;
  }

  //Draw balls
  for(var i in balls){
    var ball = balls[i];
    ctx.fillStyle = ball.colour;
    ctx.beginPath();
    ctx.arc(ball.position.x,ball.position.y,ball.radius,0,2*Math.PI);
    ctx.fill();
  }
}

//-----------------------------------------------------------------------------
//  Paint a line between two points to canvas
function drawLine(p1, p2){
  ctx.beginPath();
  ctx.moveTo(p1.x,p1.y)
  ctx.lineTo(p1.x + ((p2.x-p1.x)*(3/8)),p1.y + ((p2.y - p1.y)*(3/8)));
  ctx.stroke();
}

//-----------------------------------------------------------------------------
//  Captures key presses
window.onkeydown = function(e) {
  var key = e.keyCode ? e.keyCode : e.which;
  if (key == 39) {
    direction = 1;
  }else if (key == 37) {
    direction = -1;
  }
  if(key == 80){//(P)ause
    paused = !paused;
  }
}
window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;
  if(key == 39 || key == 37){
    direction = 0;
  }
}

//-----------------------------------------------------------------------------
//  Game loop
//  Calls update Frame repeatedly
var start = null;
window.requestAnimationFrame(step);
function step(timestamp){
  if(!start) start = timestamp;
  var progress = timestamp - start;
  if(progress > frameLength){
    start = timestamp;
    if(!paused){
      update();
    }
  }
  window.requestAnimationFrame(step);
}