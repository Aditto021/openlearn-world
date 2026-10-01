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
  }
];
