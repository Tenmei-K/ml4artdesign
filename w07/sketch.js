// ─────────────────────────────────────────────────────────────
//  Cars driving down the street — a p5.js sketch
//  Click anywhere to add a car. Cars slow down for the car ahead.
// ─────────────────────────────────────────────────────────────

const ROAD_TOP = 180;
const ROAD_BOT = 380;
const CENTER_Y = (ROAD_TOP + ROAD_BOT) / 2;

// Two lanes each way (right-hand traffic)
const LANES = [
  { y: 212, dir: -1 }, // leftbound
  { y: 258, dir: -1 },
  { y: 302, dir: 1 },  // rightbound
  { y: 348, dir: 1 },
];

const CAR_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
  "#9b59b6", "#1abc9c", "#ecf0f1", "#95a5a6", "#e67e22",
];

let cars = [];
let clouds = [];
let buildings = [];
let trees = [];

function setup() {
  createCanvas(800, 480);
  buildScenery();
  for (let i = 0; i < 12; i++) spawnCar(true);
  for (let i = 0; i < 4; i++) {
    clouds.push({ x: random(width), y: random(25, 95), s: random(0.6, 1.4), v: random(0.08, 0.3) });
  }
}

function buildScenery() {
  // a row of buildings behind the top sidewalk
  let x = -20;
  while (x < width + 20) {
    const w = random(55, 110);
    buildings.push({ x, w, h: random(50, 110), c: random() < 0.5 ? "#8395a7" : "#9aa8bd" });
    x += w + random(6, 18);
  }
  // trees along the bottom grass
  for (let i = 0; i < 6; i++) {
    trees.push({ x: 40 + (i * (width - 80)) / 5 + random(-18, 18), s: random(0.8, 1.25) });
  }
}

function draw() {
  drawSky();
  drawClouds();
  drawBuildings();
  drawStreet();
  for (const c of cars) {
    c.update();
    c.display();
  }
  drawTrees();
  drawHUD();
}

// ── Scenery ──────────────────────────────────────────────────

function drawSky() {
  noStroke();
  const top = color("#8fd0ee"), bot = color("#e3f6fd");
  for (let y = 0; y < 160; y += 4) {
    fill(lerpColor(top, bot, y / 160));
    rect(0, y, width, 4);
  }
  // sun
  fill(255, 236, 130, 120);
  circle(690, 60, 90);
  fill("#ffd93d");
  circle(690, 60, 56);
}

function drawClouds() {
  noStroke();
  fill(255, 255, 255, 230);
  for (const c of clouds) {
    c.x += c.v;
    if (c.x > width + 80) c.x = -80;
    push();
    translate(c.x, c.y);
    scale(c.s);
    ellipse(0, 0, 46, 26);
    ellipse(-22, 6, 30, 20);
    ellipse(22, 6, 34, 22);
    pop();
  }
}

function drawBuildings() {
  noStroke();
  for (const b of buildings) {
    fill(b.c);
    rect(b.x, 158 - b.h, b.w, b.h, 2);
    fill("#41566e");
    for (let wx = b.x + 8; wx + 10 <= b.x + b.w - 6; wx += 18) {
      for (let wy = 158 - b.h + 10; wy + 12 <= 150; wy += 22) {
        rect(wx, wy, 10, 12, 2);
      }
    }
  }
}

function drawStreet() {
  noStroke();

  // sidewalks
  fill("#c8ced6");
  rect(0, 158, width, 22);
  rect(0, ROAD_BOT, width, 22);
  fill("#a6b0bb"); // curbs
  rect(0, 176, width, 4);
  rect(0, ROAD_BOT, width, 4);

  // asphalt
  fill("#4a4a52");
  rect(0, ROAD_TOP, width, ROAD_BOT - ROAD_TOP);

  // solid edge lines
  fill("#f5f6fa");
  rect(0, ROAD_TOP + 6, width, 3);
  rect(0, ROAD_BOT - 9, width, 3);

  // dashed lane dividers
  for (let x = 0; x < width; x += 48) {
    rect(x, 235, 26, 4);
    rect(x, 325, 26, 4);
  }

  // double yellow center line
  fill("#f5c542");
  rect(0, CENTER_Y - 4, width, 3);
  rect(0, CENTER_Y + 1, width, 3);

  // crosswalk
  fill("#f5f6fa");
  for (let x = 560; x <= 608; x += 24) rect(x, ROAD_TOP + 10, 14, ROAD_BOT - ROAD_TOP - 20);
}

function drawTrees() {
  noStroke();
  fill("#69b34c"); // grass
  rect(0, 402, width, height - 402);
  for (const t of trees) {
    push();
    translate(t.x, 468);
    scale(t.s);
    fill("#7d5a3c");
    rect(-5, -28, 10, 30, 2);
    fill("#3e8e46");
    circle(0, -42, 42);
    circle(-15, -32, 28);
    circle(15, -32, 28);
    pop();
  }
}

function drawHUD() {
  noStroke();
  fill(0, 0, 0, 130);
  rect(10, 10, 250, 30, 8);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(14);
  text("Click to add a car  •  " + cars.length + " cars", 22, 26);
}

// ── Traffic ──────────────────────────────────────────────────

class Car {
  constructor(laneIdx, x) {
    const lane = LANES[laneIdx];
    this.lane = laneIdx;
    this.dir = lane.dir;
    this.y = lane.y;
    this.x = x;
    this.isTruck = random() < 0.22;
    this.len = this.isTruck ? random(85, 115) : random(52, 70);
    this.h = this.isTruck ? 32 : 26;
    this.col = random(CAR_COLORS);
    this.baseSpeed = random(1.8, 3.4) * (this.isTruck ? 0.7 : 1);
    this.speed = this.baseSpeed;
  }

  update() {
    // find the nearest car ahead in my lane and keep a safe distance
    let gap = Infinity;
    let aheadSpeed = this.baseSpeed;
    for (const o of cars) {
      if (o === this || o.lane !== this.lane) continue;
      const g = this.dir > 0
        ? (o.x - o.len / 2) - (this.x + this.len / 2)
        : (this.x - this.len / 2) - (o.x + o.len / 2);
      if (g >= 0 && g < gap) { gap = g; aheadSpeed = o.speed; }
    }
    let target = this.baseSpeed;
    if (gap < 45) target = min(target, aheadSpeed);
    if (gap < 20) target = min(target, 0.25);
    this.speed = lerp(this.speed, target, 0.08);
    this.x += this.dir * this.speed;

    // wrap around at the edges
    if (this.dir > 0 && this.x - this.len / 2 > width + 40) this.x = -this.len / 2 - 40;
    if (this.dir < 0 && this.x + this.len / 2 < -40) this.x = width + this.len / 2 + 40;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.dir, 1); // face the direction of travel
    noStroke();

    // shadow
    fill(0, 0, 0, 40);
    ellipse(0, this.h / 2 + 4, this.len * 0.9, 8);

    // wheels
    const wx = this.len * 0.28;
    fill("#222222");
    ellipse(-wx, this.h / 2, 14, 14);
    ellipse(wx, this.h / 2, 14, 14);
    fill("#8d8d8d");
    ellipse(-wx, this.h / 2, 6, 6);
    ellipse(wx, this.h / 2, 6, 6);

    // body
    fill(this.col);
    rect(-this.len / 2, -this.h / 2, this.len, this.h, 7);

    if (this.isTruck) {
      fill(this.col); // cab
      rect(this.len / 2 - 26, -this.h / 2 - 10, 26, 14, 4);
      fill("#cfe8ff"); // windshield
      rect(this.len / 2 - 21, -this.h / 2 - 8, 14, 8, 2);
      fill("#eceff1"); // cargo box
      rect(-this.len / 2 + 4, -this.h / 2 - 8, this.len - 40, 18, 3);
    } else {
      fill(this.col); // cabin
      rect(-this.len * 0.18, -this.h / 2 - 10, this.len * 0.44, 14, 6);
      fill("#cfe8ff"); // windows
      rect(-this.len * 0.14, -this.h / 2 - 8, this.len * 0.36, 9, 3);
    }

    // lights (front = +x after flip)
    fill("#ffe066");
    ellipse(this.len / 2 - 3, 0, 7, 7);
    fill("#ff6b6b");
    ellipse(-this.len / 2 + 3, 0, 6, 6);
    pop();
  }
}

function spawnCar(anywhere) {
  const lanes = shuffle([0, 1, 2, 3]);
  for (const i of lanes) {
    const dir = LANES[i].dir;
    for (let k = 0; k < 10; k++) {
      const guess = random(55, 115);
      const x = anywhere
        ? random(0, width)
        : dir > 0 ? -guess / 2 - 30 : width + guess / 2 + 30;
      if (laneClear(i, x, guess, 55)) {
        cars.push(new Car(i, x));
        return;
      }
    }
  }
}

function laneClear(lane, x, len, pad) {
  return cars.every((o) => o.lane !== lane || abs(o.x - x) > (o.len + len) / 2 + pad);
}

function mousePressed() {
  spawnCar(false);
}
