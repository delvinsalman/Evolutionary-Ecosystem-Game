// Everything desribed in the pdf and noted. Click for sound as well if you'd like!

// Variables
const canvasWidth = 800;
const canvasHeight = 600;
let numPrey = 200;
let numPredators = 10;
const mutationRate = 0.1;
const maxSpeed = 3;
const initialEnergy = 100;
const preyReproductionRate = 0.01;
const predatorReproductionRate = 0.005;
const preyDeathRate = 0.005;
const predatorDeathRate = 0.01;
const preyAgingRate = 0.001;
const predatorAgingRate = 0.002;
let score = 0;
let prey = [];
let predators = [];
let generation = 1;
let predatorImage;
let preyImage;
let predatorDeathCount = 0;
let backgroundImage;
let sound;
let lastResetTime = 0;
let lastAutoAddTime = 0;
let simulationStartTime;
let simulationTime = 0;


// Design
function preload() {
  predatorImage = loadImage('CookieMonster.gif');
  preyImage = loadImage('Cookie.png');
  backgroundImage = loadImage('Background.jpeg');
  sound = loadSound('Song.mp3');
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  simulationStartTime = millis();
  for (let i = 0; i < numPrey; i++) {
    prey.push(new Prey());
  }
  for (let i = 0; i < numPredators; i++) {
    predators.push(new Predator());
  }
// Buttons to add prey and pred
  let addPreyButton = createButton('Add Prey');
  addPreyButton.position(20, canvasHeight + 20);
  addPreyButton.mousePressed(addPrey);

  addPreyButton.style('background-color', 'rgb(0,192,255)');
  addPreyButton.style('color', 'black');
  addPreyButton.style('font-family', 'Cookie, cursive');

  let addPredatorButton = createButton('Add Predator');
  addPredatorButton.position(100, canvasHeight + 20);
  addPredatorButton.mousePressed(addPredator);

  addPredatorButton.style('background-color', 'rgb(0,192,255');
  addPredatorButton.style('color', 'black');
  addPredatorButton.style('font-family', 'Cookie, cursive');
}

// The main source of ageing, size and what not
function draw() {
  image(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  if (millis() - lastResetTime >= 30000) {
    lastResetTime = millis();
    for (let predator of predators) {
      predator.reset();
    }
  }

  

  for (let predator of predators) {
    predator.move();
    predator.hunt(prey);
    predator.display();
    predator.energy -= predatorAgingRate;

    if (predator.energy <= 0) {
      predators.splice(predators.indexOf(predator), 1);
      predatorDeathCount++;
    }
  }

  for (let p of prey) {
    p.move();
    p.display();
    p.energy -= preyAgingRate;

    if (p.energy <= 0) {
      prey.splice(prey.indexOf(p), 1);
    }
  }

  if (random(1) < preyDeathRate && prey.length > numPrey / 2) {
    prey.pop();
  }

  if (random(1) < predatorDeathRate && predators.length > numPredators / 2) {
    predators.pop();
    predatorDeathCount++;
  }

  if (random(1) < preyReproductionRate && prey.length < numPrey) {
    let parent = random(prey);
    prey.push(parent.reproduce());
  }

  if (random(1) < predatorReproductionRate && predators.length < numPredators) {
    let parent = random(predators);
    predators.push(parent.reproduce());
  }

  if (prey.length < 80) {
    for (let i = 0; i < 10; i++) {
      let newPrey = new Prey();
      prey.push(newPrey);
      numPrey++;
    }
  } else if (prey.length >= 80 && prey.length < 100) {
    for (let i = 0; i < 10; i++) {
      let newPrey = new Prey();
      prey.push(newPrey);
      numPrey++;
    }
  }

  if (predators.length >= 3 && predators.length <= 4) {
    for (let i = 0; i < 5; i++) {
      let newPredator = new Predator();
      predators.push(newPredator);
      numPredators++;
    }
  }

  for (let p of prey) {
    if (random(1) < mutationRate) {
      p.mutate();
    }
  }

  for (let predator of predators) {
    if (random(1) < mutationRate) {
      predator.mutate();
    }
  }

  // Our value systems
  fill(0);
  textSize(16);
  textStyle(BOLD);
  text(`Generation: ${generation}`, 20, 20);
  text(`Number of Prey: ${prey.length}`, 20, 40);
  text(`Number of Predators: ${predators.length}`, 20, 60);
  text(`Predator Deaths: ${predatorDeathCount}`, 20, 80);
  fill('red');
  text(`Score: ${score}`, 20, 100);

  simulationTime = millis() - simulationStartTime;
  let seconds = Math.floor(simulationTime / 1000);
  text(`Elapsed Time: ${seconds} seconds`, 20, 120);
}

function addPrey() {
  for (let i = 0; i < 10; i++) {
    let newPrey = new Prey();
    prey.push(newPrey);
    numPrey++;
  }
}

function addPredator() {
  let newPredator = new Predator();
  predators.push(newPredator);
  numPredators++;
}

function autoAddPredators(numToAdd) {
  for (let i = 0; i < numToAdd; i++) {
    let newPredator = new Predator();
    predators.push(newPredator);
    numPredators++;
  }
}

function autoAddPrey(numToAdd) {
  for (let i = 0; i < numToAdd; i++) {
    let newPrey = new Prey();
    prey.push(newPrey);
    numPrey++;
  }
}

// Our prey class info
class Prey {
  constructor(dna) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(random(1, maxSpeed));
    this.energy = initialEnergy;
    this.size = 30;
    this.foodBatches = 0;

    this.dna = {
      speed: random(0.5, 2.0),
      size: random(20, 40),
    };

    if (dna) {
      if (dna.speed) this.dna.speed = dna.speed;
      if (dna.size) this.dna.size = dna.size;
    }
  }

  move() {
    let previousPosition = this.position.copy();

    this.position.add(this.velocity);

    if (this.position.x < 0 || this.position.x > canvasWidth || this.position.y < 0 || this.position.y > canvasHeight) {
      this.position = previousPosition;
      this.velocity.mult(-1);
    } else {
      this.position.x = (this.position.x + canvasWidth) % canvasWidth;
      this.position.y = (this.position.y + canvasHeight) % canvasHeight;
    }
  }

  display() {
    image(preyImage, this.position.x, this.position.y, this.size, this.size);
  }

  reproduce() {
    let child = new Prey(this.dna);
    child.energy = this.energy / 2;
    return child;
  }

  mutate() {
    if (random(1) < mutationRate) {
      this.dna.speed += random(-0.1, 0.1);
      this.dna.size += random(-5, 5);
    }

    this.dna.speed = constrain(this.dna.speed, 0.5, 2.0);
    this.dna.size = constrain(this.dna.size, 20, 40);
  }
}

// Our predator class info
class Predator {
  constructor(dna) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(random(1, maxSpeed));
    this.energy = initialEnergy;
    this.size = 50;
    this.visionRange = random(50, 100);
    this.healthBarWidth = 50;
    this.consumedPreyCount = 0;
    this.sizeIncreases = 0;
    this.pointsMultiplier = 1;

    this.rotationAngle = 0;

    this.dna = {
      speed: random(0.5, 2.0),
      visionRange: random(50, 100),
    };

    
    if (dna) {
      if (dna.speed) this.dna.speed = dna.speed;
      if (dna.visionRange) this.dna.visionRange = dna.visionRange;
    }
  }

 move() {
  let previousPosition = this.position.copy();
  let newPosition = this.position.copy().add(this.velocity);

 
   
  for (let otherPredator of predators) {
    if (otherPredator !== this) {
      let d = dist(newPosition.x, newPosition.y, otherPredator.position.x, otherPredator.position.y);
      let combinedRadii = this.size / 2 + otherPredator.size / 2;

      if (d < combinedRadii) {
       
        let collisionNormal = p5.Vector.sub(this.position, otherPredator.position);
        collisionNormal.normalize();

       
        let thisVelocity = this.velocity.copy();
        this.velocity = p5.Vector.reflect(thisVelocity, collisionNormal);

        let otherVelocity = otherPredator.velocity.copy();
        otherPredator.velocity = p5.Vector.reflect(otherVelocity, collisionNormal);
      }
    }
  }

  newPosition.x = constrain(newPosition.x, 0, canvasWidth - this.size);
  newPosition.y = constrain(newPosition.y, 0, canvasHeight - this.size);

  this.position = newPosition;
  this.rotationAngle += this.sizeIncreases * 0.02;
}

// How they hunt in defieing them
  hunt(prey) {
    for (let i = prey.length - 1; i >= 0; i--) {
      let p = prey[i];
      let d = dist(this.position.x, this.position.y, p.position.x, p.position.y);
      if (d < this.visionRange && p.energy > 0) {
        this.velocity = createVector(p.position.x - this.position.x, p.position.y - this.position.y);
        this.velocity.normalize();
        
        
        
        this.velocity.mult(maxSpeed);
        this.energy += 1;
        p.energy -= 1;
        if (p.energy <= 0) {
          prey.splice(i, 1);
          score += 10 * this.pointsMultiplier;
          this.consumedPreyCount++;
          if (this.consumedPreyCount >= 5 && this.sizeIncreases < 2) {
            this.size *= 2;
            this.consumedPreyCount = 0;
            this.sizeIncreases++;
            this.pointsMultiplier = 4;
          }
        }
        break;
      }
    }
    this.energy -= 0.1;
    if (this.energy <= 0) {
      this.reset();
    }
  }

  // Reseting values
  reset() {
  this.energy = initialEnergy;
  this.consumedPreyCount = 0;
  this.size = 50;
  this.sizeIncreases = 0;
  this.pointsMultiplier = 1;
  this.visionRange = random(50, 100);

  
  this.rotationAngle = 0;


    
  this.position = createVector(random(canvasWidth), random(canvasHeight));
}

  // Size rate
  display() {
    push(); 
    
    translate(this.position.x + this.size / 2, this.position.y + this.size / 2);
    rotate(this.rotationAngle); 
image(predatorImage, -this.size / 2, -this.size / 2, this.size, this.size); 
    pop(); 
  }

  // Reproduce rate and var
  reproduce() {
    let child = new Predator(this.dna);
    child.energy = this.energy / 2;
    return child;
  }

  // Mutation rate
  mutate() {
    this.velocity.rotate(random(-0.1, 0.1));
    this.dna.visionRange += random(-10, 10);
  }
}

// To play sound
function mousePressed() {
  if (!sound.isPlaying()) {
    sound.loop();
  }
}
