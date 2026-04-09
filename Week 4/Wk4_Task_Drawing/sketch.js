/* DN1010 Experimental Interaction
 * Week 4 - Generative Drawing
 * Boids
 */

let flock;

function setup() {
  createCanvas(800, 800); // *** change artwork size here

  background(182, 122, 235); // *** change background colour here (purple)

  // Add an initial set of boids into the system.
  flock = new Flock();
  for (let i = 0; i < 100; i++) {
    let b = new Boid(random(width), random(height));
    flock.addBoid(b);
  }
}

function draw() {
  flock.run();
}

// Flock Object
// Manages the array of all the boids.

function Flock() {
  // Initialises an array for all the boids.
  this.boids = [];
}

Flock.prototype.run = function () {
  // Passing the entire list of boids to each boid individually.
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
};

Flock.prototype.addBoid = function (b) {
  this.boids.push(b);
};

// Boid Class
// Manages all methods and properties of the boids.

// Create main properties of boid.
function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 1.0;
  this.maxSpeed = 3;
  this.maxForce = 0.3;
}

// Run all other boid methods.
Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};

// Applies all forces for extra effects.
Boid.prototype.applyForce = function (force) {
  this.acceleration.add(force);
};

// Accumulates a new acceleration each time based on 4 rules.
Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids); // Separation
  let ali = this.align(boids); // Alignment
  let coh = this.cohesion(boids); // Cohesion
  let fol = this.mouse(boids); // Follow Mouse

  // Arbitrarily weight these forces.
  sep.mult(1.0);
  ali.mult(1.0);
  coh.mult(1.0);
  // Specially weighted (<1) so lines subtly follow the mouse and do not immediately race to the mouse position.
  fol.mult(0.4);

  // Add the force vectors to acceleration based on conditions.
  if (key == "s") this.applyForce(sep);
  else if (key == "a") this.applyForce(ali);
  else if (key == "c") this.applyForce(coh);
  else;
  this.applyForce(fol);
};

// Update location.
Boid.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed);
  this.position.add(this.velocity);

  // *** For aesthetic effect only. Draws extra lines when momentum changes.
  push();
  stroke(250, 224, 57); // *** change line colour here (yellow)
  strokeWeight(0.3); // *** change line weight here
  line(
    this.acceleration.x * 70 + this.position.x,
    this.acceleration.y * 70 + this.position.y,
    this.position.x,
    this.position.y
  );
  pop();

  // Reset accelertion to 0 each cycle.
  this.acceleration.mult(0);
};

// Calculates and applies a steering force towards a target.
Boid.prototype.seek = function (target) {
  // A vector pointing from the location to the target.
  let desired = p5.Vector.sub(target, this.position);

  // Normalize desired and scale to maximum speed.
  desired.normalize();
  desired.mult(this.maxSpeed);

  // Steering = Desired minus Velocity.
  let steer = p5.Vector.sub(desired, this.velocity);

  // Limit to maximum steering force.
  steer.limit(this.maxForce);
  return steer;
};

// Displays boids to canvas.
Boid.prototype.render = function () {
  let theta = this.velocity.heading() + PI / 2;
  fill(0);
  stroke(0);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  pop();
};

// Checks borders to exit and continue from opposite side.
Boid.prototype.borders = function () {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
};

// Rules of Flocking

// Separation
// Checks for nearby boids and steers away.
Boid.prototype.separate = function (boids) {
  let desiredSeparation = 100;

  let steer = createVector(0, 0);
  let count = 0;

  // For every boid in the system, check if it's too close.
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    if (d > 0 && d < desiredSeparation) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      steer.add(diff);
      count++;
    }
  }

  if (count > 0) {
    stroke(217, 26, 26); // *** change line colour here (red)
    strokeWeight(0.4);
    line(steer.x + this.position.x, steer.y + this.position.y, this.position.x, this.position.y);
    steer.div(count);
  }

  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.velocity);
    steer.limit(this.maxForce);
  }

  return steer;
};

// Alignment
// For every nearby boid in the system, calculate the average velocity.
Boid.prototype.align = function (boids) {
  let neighbordist = 50;

  let sum = createVector(0, 0);
  let count = 0;

  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].velocity);
      count++;
    }
  }

  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location.
Boid.prototype.cohesion = function (boids) {
  let neighbordist = 50;

  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].position);
      count++;
    }
  }

  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Steer towards the location.
  } else {
    return createVector(0, 0);
  }
};

// Follow Mouse
// Steers all boids to mouse position when mouse is pressed.
Boid.prototype.mouse = function (boids) {
  if (mouseIsPressed) return this.seek(createVector(mouseX, mouseY));
  else return createVector(0, 0);
};
