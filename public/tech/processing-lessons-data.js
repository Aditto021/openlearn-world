// Real, runnable p5.js code — p5.js is the official free web sibling of
// Processing (made by the same Processing Foundation), so every sketch here
// also works almost unchanged if you install the desktop Processing app.
const PROCESSING_LESSONS = [
  {
    id: 'firstshape',
    icon: '⭕',
    title: 'Your first shape',
    summary: 'Every sketch has two parts: setup() runs once when it starts, draw() runs forever after that — about 60 times a second.',
    code:
`function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(230, 240, 255);
  fill(255, 120, 90);
  noStroke();
  ellipse(150, 150, 120, 120);
}`
  },
  {
    id: 'colors',
    icon: '🎨',
    title: 'Colors & shapes',
    summary: 'fill() sets the color for whatever you draw next. Colors are Red, Green, Blue — each a number from 0 to 255.',
    code:
`function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(255);
  fill(80, 200, 160);
  rect(30, 30, 100, 100);
  fill(255, 200, 60);
  ellipse(220, 80, 100, 100);
  fill(120, 130, 240);
  triangle(60, 240, 140, 150, 220, 240);
}`
  },
  {
    id: 'move',
    icon: '➡️',
    title: 'Variables & movement',
    summary: 'A variable can change every single frame — that is how you make things move. Nudge x a little, draw, repeat.',
    code:
`let x = 0;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(20, 20, 35);
  x = x + 2;
  if (x > width) x = 0;
  fill(255, 220, 80);
  noStroke();
  ellipse(x, 150, 40, 40);
}`
  },
  {
    id: 'mouse',
    icon: '🖱️',
    title: 'Follow the mouse',
    summary: 'mouseX and mouseY are built-in variables that always hold the pointer\'s position — move your mouse over the preview!',
    code:
`function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(245, 245, 250);
  fill(90, 160, 250, 180);
  noStroke();
  ellipse(mouseX, mouseY, 50, 50);
}`
  },
  {
    id: 'loops',
    icon: '🔲',
    title: 'Loops make patterns',
    summary: 'A for loop repeats code for you. Nest two loops and you can draw a whole grid of shapes in just a few lines.',
    code:
`function setup() {
  createCanvas(300, 300);
  noLoop();
}

function draw() {
  background(255);
  for (let gx = 0; gx < 6; gx++) {
    for (let gy = 0; gy < 6; gy++) {
      fill(50 * gx, 255 - 30 * gy, 200);
      noStroke();
      ellipse(gx * 50 + 25, gy * 50 + 25, 36, 36);
    }
  }
}`
  },
  {
    id: 'bounce',
    icon: '🏀',
    title: 'Bouncing ball',
    summary: 'Give a shape a speed, and bounce it off the walls when it hits an edge — your very first mini physics!',
    code:
`let x = 150, y = 150;
let speedX = 3, speedY = 2;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(255, 250, 235);
  x += speedX;
  y += speedY;
  if (x < 20 || x > width - 20) speedX *= -1;
  if (y < 20 || y > height - 20) speedY *= -1;
  fill(240, 90, 90);
  noStroke();
  circle(x, y, 40);
}`
  },
  {
    id: 'dinojump',
    icon: '🦖',
    title: 'Dino Jump',
    summary: 'A classic endless runner! Learn gravity, jumping, and collision with dist(). Click inside the preview once so it can hear your keyboard, then press SPACE to jump over the cactus.',
    code:
`let dinoY = 200;
let velocity = 0;
let groundY = 200;
let obstacleX = 300;
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(300, 220);
}

function draw() {
  background(255, 250, 235);
  fill(170);
  rect(0, groundY + 30, width, 4);

  if (!gameOver) {
    velocity += 1;
    dinoY += velocity;
    if (dinoY > groundY) { dinoY = groundY; velocity = 0; }

    obstacleX -= 4;
    if (obstacleX < -20) { obstacleX = width + random(0, 60); score++; }

    if (dist(50, dinoY, obstacleX, groundY + 15) < 22) gameOver = true;
  }

  fill(76, 175, 80);
  rect(40, dinoY - 20, 24, 30, 6);
  fill(220, 90, 90);
  rect(obstacleX, groundY, 14, 30);

  fill(0);
  textSize(14);
  text('Score: ' + score, 10, 20);
  if (gameOver) {
    textAlign(CENTER);
    text('Game over! Press SPACE to restart', width / 2, 100);
    textAlign(LEFT);
  }
}

function keyPressed() {
  if (key === ' ') {
    if (gameOver) {
      gameOver = false; score = 0; dinoY = groundY; velocity = 0; obstacleX = width;
    } else if (dinoY >= groundY) {
      velocity = -14;
    }
  }
}`
  },
  {
    id: 'fruitbasket',
    icon: '🧺',
    title: 'Fruit Basket Catch',
    summary: 'Move the basket with the arrow keys and catch falling fruit before it hits the ground. Click inside the preview once so it can hear your keyboard!',
    code:
`let basketX = 150;
let fruits = [];
let caught = 0;
let missed = 0;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(235, 245, 255);

  if (keyIsDown(LEFT_ARROW)) basketX -= 5;
  if (keyIsDown(RIGHT_ARROW)) basketX += 5;
  basketX = constrain(basketX, 20, width - 20);

  if (frameCount % 40 === 0) {
    fruits.push({ x: random(20, width - 20), y: 0 });
  }

  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    f.y += 3;
    fill(255, 140, 60);
    noStroke();
    ellipse(f.x, f.y, 18, 18);

    if (f.y > height - 30 && abs(f.x - basketX) < 25) {
      caught++;
      fruits.splice(i, 1);
    } else if (f.y > height) {
      missed++;
      fruits.splice(i, 1);
    }
  }

  fill(140, 90, 40);
  rect(basketX - 25, height - 20, 50, 14, 4);

  fill(0);
  textSize(14);
  text('Caught: ' + caught + '   Missed: ' + missed, 10, 20);
}`
  },
  {
    id: 'balloonpop',
    icon: '🎈',
    title: 'Balloon Pop',
    summary: 'Click each balloon before it floats off the top of the screen — practice detecting clicks on moving shapes with dist().',
    code:
`let balloons = [];
let popped = 0;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(20, 24, 45);

  if (frameCount % 35 === 0) {
    balloons.push({ x: random(30, width - 30), y: height + 20, c: color(random(255), random(255), random(255)) });
  }

  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    b.y -= 2;
    fill(b.c);
    noStroke();
    ellipse(b.x, b.y, 30, 36);
    if (b.y < -20) balloons.splice(i, 1);
  }

  fill(255);
  textSize(14);
  text('Popped: ' + popped, 10, 20);
}

function mousePressed() {
  for (let i = balloons.length - 1; i >= 0; i--) {
    if (dist(mouseX, mouseY, balloons[i].x, balloons[i].y) < 20) {
      balloons.splice(i, 1);
      popped++;
    }
  }
}`
  },
  {
    id: 'pongpaddle',
    icon: '🏓',
    title: 'Pong Paddle',
    summary: 'Move your mouse to control the paddle and keep the ball bouncing — classic reflection physics in just a few lines.',
    code:
`let paddleX = 150;
let ballX = 150, ballY = 150;
let speedX = 3, speedY = 3;
let bounces = 0;
let gameOver = false;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(15, 20, 35);
  paddleX = constrain(mouseX, 30, width - 30);

  if (!gameOver) {
    ballX += speedX;
    ballY += speedY;
    if (ballX < 10 || ballX > width - 10) speedX *= -1;
    if (ballY < 10) speedY *= -1;

    if (ballY > height - 30 && abs(ballX - paddleX) < 35) {
      speedY *= -1;
      bounces++;
    } else if (ballY > height) {
      gameOver = true;
    }
  }

  fill(250, 204, 21);
  rect(paddleX - 30, height - 16, 60, 10, 4);
  fill(255);
  ellipse(ballX, ballY, 16, 16);

  fill(255);
  textSize(14);
  text('Bounces: ' + bounces, 10, 20);
  if (gameOver) {
    textAlign(CENTER);
    text('Game over! Move the mouse to try again.', width / 2, height / 2);
    textAlign(LEFT);
  }
}

function mouseMoved() {
  if (gameOver) {
    gameOver = false;
    ballX = width / 2; ballY = 100;
    speedX = 3; speedY = 3;
    bounces = 0;
  }
}`
  },
  {
    id: 'coincollector',
    icon: '🪙',
    title: 'Coin Collector',
    summary: 'Move your square with the arrow keys and grab every golden coin. Click inside the preview once so it can hear your keyboard!',
    code:
`let px = 150, py = 150;
let coins = [];
let score = 0;

function setup() {
  createCanvas(300, 300);
  for (let i = 0; i < 5; i++) coins.push({ x: random(20, width - 20), y: random(20, height - 20) });
}

function draw() {
  background(230, 250, 235);

  if (keyIsDown(LEFT_ARROW)) px -= 3;
  if (keyIsDown(RIGHT_ARROW)) px += 3;
  if (keyIsDown(UP_ARROW)) py -= 3;
  if (keyIsDown(DOWN_ARROW)) py += 3;
  px = constrain(px, 15, width - 15);
  py = constrain(py, 15, height - 15);

  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    fill(250, 204, 21);
    noStroke();
    ellipse(c.x, c.y, 16, 16);
    if (dist(px, py, c.x, c.y) < 18) {
      coins.splice(i, 1);
      score++;
      coins.push({ x: random(20, width - 20), y: random(20, height - 20) });
    }
  }

  fill(60, 130, 230);
  rect(px - 12, py - 12, 24, 24, 6);

  fill(0);
  textSize(14);
  text('Coins: ' + score, 10, 20);
}`
  },
  {
    id: 'molesmash',
    icon: '🔨',
    title: 'Mole Smash',
    summary: 'A mole pops up in a random spot — click it fast before it disappears! Practice random positions and timed events.',
    code:
`let moleIndex = -1;
let score = 0;
const cols = 3, rows = 3, cellSize = 90;

function setup() {
  createCanvas(270, 270);
}

function draw() {
  background(230, 220, 200);

  if (frameCount % 45 === 0) {
    moleIndex = floor(random(cols * rows));
  }

  for (let i = 0; i < cols * rows; i++) {
    const cx = (i % cols) * cellSize + cellSize / 2;
    const cy = floor(i / cols) * cellSize + cellSize / 2;
    fill(170, 120, 70);
    noStroke();
    ellipse(cx, cy, cellSize - 20, cellSize - 20);
    if (i === moleIndex) {
      fill(120, 80, 50);
      ellipse(cx, cy, 40, 40);
    }
  }

  fill(0);
  textSize(14);
  text('Score: ' + score, 10, 20);
}

function mousePressed() {
  if (moleIndex < 0) return;
  const cx = (moleIndex % cols) * cellSize + cellSize / 2;
  const cy = floor(moleIndex / cols) * cellSize + cellSize / 2;
  if (dist(mouseX, mouseY, cx, cy) < 20) {
    score++;
    moleIndex = -1;
  }
}`
  },
  {
    id: 'spacedodger',
    icon: '🚀',
    title: 'Space Dodger',
    summary: 'Steer your ship with the mouse and dodge the falling asteroids as long as you can — survival games are built from the same ideas as everything else here.',
    code:
`let shipX = 150;
let rocks = [];
let survived = 0;
let gameOver = false;

function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(5, 5, 20);
  shipX = constrain(mouseX, 15, width - 15);

  if (!gameOver) {
    survived++;
    if (frameCount % 30 === 0) rocks.push({ x: random(10, width - 10), y: -10 });

    for (let i = rocks.length - 1; i >= 0; i--) {
      rocks[i].y += 4;
      fill(150);
      noStroke();
      ellipse(rocks[i].x, rocks[i].y, 18, 18);
      if (dist(shipX, height - 20, rocks[i].x, rocks[i].y) < 16) gameOver = true;
      if (rocks[i].y > height) rocks.splice(i, 1);
    }
  }

  fill(80, 200, 255);
  triangle(shipX, height - 32, shipX - 12, height - 10, shipX + 12, height - 10);

  fill(255);
  textSize(14);
  text('Survived: ' + floor(survived / 60) + 's', 10, 20);
  if (gameOver) {
    textAlign(CENTER);
    text('Crashed! Click to try again.', width / 2, height / 2);
    textAlign(LEFT);
  }
}

function mousePressed() {
  if (gameOver) {
    gameOver = false; rocks = []; survived = 0;
  }
}`
  },
  {
    id: 'brickbreaker',
    icon: '🧱',
    title: 'Brick Breaker',
    summary: 'Bounce the ball with your mouse-controlled paddle and break every brick — a tiny version of a video game classic.',
    code:
`let paddleX = 150;
let ballX = 150, ballY = 220;
let speedX = 3, speedY = -3;
let bricks = [];

function setup() {
  createCanvas(300, 260);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 6; c++) {
      bricks.push({ x: c * 48 + 6, y: r * 20 + 10, hit: false });
    }
  }
}

function draw() {
  background(15, 15, 30);
  paddleX = constrain(mouseX, 30, width - 30);

  ballX += speedX;
  ballY += speedY;
  if (ballX < 8 || ballX > width - 8) speedX *= -1;
  if (ballY < 8) speedY *= -1;
  if (ballY > height - 20 && abs(ballX - paddleX) < 35) speedY *= -1;

  let remaining = 0;
  for (const b of bricks) {
    if (!b.hit) {
      remaining++;
      fill(239, 100, 90);
      noStroke();
      rect(b.x, b.y, 44, 16);
      if (ballX > b.x && ballX < b.x + 44 && ballY > b.y && ballY < b.y + 16) {
        b.hit = true;
        speedY *= -1;
      }
    }
  }

  fill(250, 204, 21);
  rect(paddleX - 30, height - 14, 60, 8, 4);
  fill(255);
  ellipse(ballX, ballY, 12, 12);

  if (remaining === 0) {
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text('You cleared every brick! 🎉', width / 2, height / 2);
    textAlign(LEFT);
  }
}`
  },
  {
    id: 'fishingcatch',
    icon: '🎣',
    title: 'Fishing Catch',
    summary: "Fish swim across the pond — click each one before it swims away! You have 20 seconds, so be quick.",
    code:
`let fish = [];
let caught = 0;
let timeLeft = 20 * 60;

function setup() {
  createCanvas(300, 260);
}

function draw() {
  background(100, 180, 220);

  if (timeLeft > 0) {
    timeLeft--;
    if (frameCount % 50 === 0) {
      fish.push({ x: -20, y: random(40, height - 20), speed: random(2, 4) });
    }
    for (let i = fish.length - 1; i >= 0; i--) {
      fish[i].x += fish[i].speed;
      fill(255, 170, 60);
      noStroke();
      ellipse(fish[i].x, fish[i].y, 26, 14);
      if (fish[i].x > width + 20) fish.splice(i, 1);
    }
  }

  fill(255);
  textSize(14);
  text('Caught: ' + caught, 10, 20);
  text('Time: ' + ceil(timeLeft / 60) + 's', width - 70, 20);

  if (timeLeft <= 0) {
    textAlign(CENTER);
    textSize(16);
    text("Time's up! You caught " + caught + ' fish', width / 2, height / 2);
    textAlign(LEFT);
  }
}

function mousePressed() {
  for (let i = fish.length - 1; i >= 0; i--) {
    if (dist(mouseX, mouseY, fish[i].x, fish[i].y) < 18) {
      fish.splice(i, 1);
      caught++;
    }
  }
}`
  },
  {
    id: 'snakelite',
    icon: '🐍',
    title: 'Snake Lite',
    summary: "Steer the snake with the arrow keys, eat the gold square, and don't run into yourself — the original grid-based game, in under 40 lines. Click inside the preview once so it can hear your keyboard!",
    code:
`let snake = [{ x: 5, y: 5 }];
let dir = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
const cell = 15, cols = 18, rows = 14;
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(cols * cell, rows * cell);
  frameRate(10);
}

function draw() {
  background(20, 30, 20);

  if (!gameOver) {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) gameOver = true;
    for (const s of snake) if (s.x === head.x && s.y === head.y) gameOver = true;

    if (!gameOver) {
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        food = { x: floor(random(cols)), y: floor(random(rows)) };
      } else {
        snake.pop();
      }
    }
  }

  fill(250, 204, 21);
  noStroke();
  rect(food.x * cell, food.y * cell, cell, cell);
  fill(80, 220, 120);
  for (const s of snake) rect(s.x * cell, s.y * cell, cell - 1, cell - 1);

  fill(255);
  textSize(14);
  text('Score: ' + score, 6, 16);
  if (gameOver) {
    textAlign(CENTER);
    text('Game over! Press R to restart', width / 2, height / 2);
    textAlign(LEFT);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW && dir.x === 0) dir = { x: -1, y: 0 };
  else if (keyCode === RIGHT_ARROW && dir.x === 0) dir = { x: 1, y: 0 };
  else if (keyCode === UP_ARROW && dir.y === 0) dir = { x: 0, y: -1 };
  else if (keyCode === DOWN_ARROW && dir.y === 0) dir = { x: 0, y: 1 };
  else if (key === 'r' || key === 'R') {
    snake = [{ x: 5, y: 5 }]; dir = { x: 1, y: 0 }; score = 0; gameOver = false;
  }
}`
  }
];
