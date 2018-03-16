init(256);
update();

function rotateSquare(theta){
  for(var c in square.corners){
    square.corners[c] = rotate(square.corners[c], theta);
  }
  for(var c in square.innerCorners){
    square.innerCorners[c] = rotate(square.innerCorners[c], theta);
  }
}

function rotate(point, theta){
  var tempX = point.x - gameSize/2;
  var tempY = point.y - gameSize/2;
  var rotX = (tempX * Math.cos(theta)) - (tempY * Math.sin(theta));
  var rotY = (tempX * Math.sin(theta)) + (tempY * Math.cos(theta));
  point.x = rotX + gameSize/2;
  point.y = rotY + gameSize/2;
  return point;
}

function init(gameSizeX){
  //Create canvas
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = gameSizeX;
  canvas.height = gameSizeX;
  canvas.style.cssText += "display:block; margin: auto; width: " + gameSizeX + "px; height: " + gameSizeX + "px;";
  document.body.insertBefore(canvas, document.body.firstChild);

  //Init variables
  gameSize = gameSizeX;
  frameLength = 25;
  direction = 0;
  paused = false;
  dead = false;
  rotateSpeed = 0.02;
  nx = ny = lx = ly = 0;

  ball = {
    position: { x: gameSize/2, y: gameSize/2 },
    speed: { x: 1, y: 1 },
    radius: gameSize/64,
    color: "#000"
  }

  square = {
    corners: [
      { x: 2*gameSize/8, y: 2*gameSize/8 },
      { x: 6*gameSize/8, y: 2*gameSize/8 },
      { x: 6*gameSize/8, y: 6*gameSize/8 },
      { x: 2*gameSize/8, y: 6*gameSize/8 }
    ],
    innerCorners: [
      { x: 2*gameSize/8 + ball.radius, y: 2*gameSize/8 + ball.radius },
      { x: 6*gameSize/8 - ball.radius, y: 2*gameSize/8 + ball.radius },
      { x: 6*gameSize/8 - ball.radius, y: 6*gameSize/8 - ball.radius },
      { x: 2*gameSize/8 + ball.radius, y: 6*gameSize/8 - ball.radius }
    ],
    color: "#FFF"
  }
}

//Check if hit edge
function check(){
  var area1 = areaTriangle(square.innerCorners[0], ball.position, square.innerCorners[3]);
  var area2 = areaTriangle(square.innerCorners[2], ball.position, square.innerCorners[3]);
  var area3 = areaTriangle(square.innerCorners[2], ball.position, square.innerCorners[1]);
  var area4 = areaTriangle(ball.position, square.innerCorners[1], square.innerCorners[0]);
  var areaSq = Math.pow((gameSize/2 - 2*ball.radius),2);
  return(Math.round(area1 + area2 + area3 + area4) <= areaSq);
}

function areaTriangle(a,b,c){
  var p1 = a.x * (b.y - c.y);
  var p2 = b.x * (c.y - a.y);
  var p3 = c.x * (a.y - b.y);
  return Math.abs((p1+p2+p3)/2);
}

function dist(a,b){
  return(Math.sqrt(Math.pow(b.x-a.x,2) + Math.pow(b.y-a.y,2)));
}

function update(){
  rotateSquare(direction * rotateSpeed);

  //Moveball
  ball.position.x += ball.speed.x;
  ball.position.y += ball.speed.y;

  if(!check() && !dead){ //If wall hit

    //Rotate ball with wall 
    ball.position = rotate(ball.position,(direction*rotateSpeed));

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

    if(distances[0].distance >= 3*gameSize/16){ //Hit gap
      dead = true;

    } else if(distances[1].distance == distances[2].distance) { //Hit corner
        ball.speed.x = - ball.speed.x;
        ball.speed.y = - ball.speed.y;

    } else { //Hit wall
      //Get speed
      var speed = rotateSpeed * direction * dist(ball.position, {x: gameSize/2, y: gameSize/2});
      var next = rotate(ball.position, direction * rotateSpeed * 10);
      console.log
      nx = ball.position.x - next.x;
      ny = ball.position.y - next.y;
            console.log(nx);



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
    }
  }
  draw();
}

function draw(){
  ctx.clearRect(0,0,gameSize,gameSize);

  //Square
  ctx.strokeStyle = "black";
  ctx.fillStyle ="#beff93";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(square.corners[0].x, square.corners[0].y);
  ctx.lineTo(square.corners[1].x, square.corners[1].y);
  ctx.lineTo(square.corners[2].x, square.corners[2].y);
  ctx.lineTo(square.corners[3].x, square.corners[3].y);
  ctx.closePath();
  ctx.fill();

  var prev = 3;
  for(var x = 0; x < square.corners.length; x++){
    drawLine(square.corners[prev], square.corners[x]);
    drawLine(square.corners[x], square.corners[prev]);
    prev = x;
  }

  //Circle
  ctx.fillStyle = "#282584";
  ctx.beginPath();
  ctx.arc(ball.position.x,ball.position.y,ball.radius,0,2*Math.PI);
  ctx.fill();

  
  ctx.beginPath();
  ctx.moveTo(ball.position.x, ball.position.y);
  ctx.lineTo(ball.position.x + nx* 150, ball.position.y + ny*150);
  ctx.stroke();
}

function drawLine(p1, p2){
  ctx.beginPath();
  ctx.moveTo(p1.x,p1.y)
  ctx.lineTo(p1.x + ((p2.x-p1.x)*(3/8)),p1.y + ((p2.y - p1.y)*(3/8)));
  ctx.stroke();
}

//Captures key presses
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

//Calls update Frame repeatedly
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