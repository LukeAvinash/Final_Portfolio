/* DN1010 Experimental Interaction
 * Week 5 - Computer Vision
 * Webcam Drawing
 */

var camera;
var prevImg;
var currImg;
var diffImg;
var spotImg;
// *** change sensitivity (decimal between 0 - 1)
// Lowered 0.1 to 2 decimal points. Any lower than that, the camera will track objects far in the background
var threshold = 0.05;
var grid;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  camera = createCapture(VIDEO, { flipped: true });
  camera.hide();

  grid = new Grid(1280, 720);
}

function draw() {
  background(120);
  image(camera, 0, 0, 1280, 720);
  camera.loadPixels();

  var smallW = camera.width / 4;
  var smallH = camera.height / 4;

  currImg = createImage(smallW, smallH);
  currImg.copy(camera, 0, 0, camera.width, camera.height, 0, 0, smallW, smallH);
  currImg.filter("gray");
  currImg.filter("blur", 2);

  diffImg = createImage(smallW, smallH);

  spotImg = createImage(smallW / 2, smallH / 2);
  spotImg.copy(
    camera,
    0,
    0,
    camera.width,
    camera.height,
    0,
    0,
    smallW / 2,
    smallH / 2
  );
  spotImg.filter("gray");

  if (typeof prevImg !== "undefined") {
    currImg.loadPixels();
    prevImg.loadPixels();
    diffImg.loadPixels();
    spotImg.loadPixels();

    for (var x = 0; x < currImg.width; x += 1) {
      for (var y = 0; y < currImg.height; y += 1) {
        var index = (x + y * currImg.width) * 4;
        var redCurr = currImg.pixels[index];
        var redPrev = prevImg.pixels[index];
        var d = abs(redCurr - redPrev);

        diffImg.pixels[index + 0] = d;
        diffImg.pixels[index + 1] = d;
        diffImg.pixels[index + 2] = d;
        diffImg.pixels[index + 3] = 255;
      }
    }

    diffImg.updatePixels();
  }

  prevImg = createImage(smallW, smallH);
  prevImg.copy(
    currImg,
    0,
    0,
    currImg.width,
    currImg.height,
    0,
    0,
    smallW,
    smallH
  );

  diffImg.filter("threshold", threshold);

  image(currImg, 1280, 0);
  image(diffImg, 1280, currImg.height);

  grid.update(diffImg);
}

function mousePressed() {
  threshold = map(mouseX, 0, 1280, 0, 1);
  console.log(threshold);
}

var Grid = function (_w, _h) {
  this.diffImg = 0;
  // *** change spacing between each point
  // Value needs to have a perfect "middle" for the color gradient to be seen
  this.noteWidth = 4.5; 
  this.worldWidth = _w;
  this.worldHeight = _h;
  this.numOfNotesX = int(this.worldWidth / this.noteWidth);
  this.numOfNotesY = int(this.worldHeight / this.noteWidth);
  this.arrayLength = this.numOfNotesX * this.numOfNotesY;
  this.noteStates = [];
  this.noteStates = new Array(this.arrayLength).fill(0);
  this.colorArray = [];
  console.log(this);
  console.log(_w, _h);

  for (var i = 0; i < this.arrayLength; i++) {
    this.colorArray.push(
      // *** set colours of the points
      lerpColor(color(15, 245, 206, 150), color(111, 93, 222, 150), 0.000045 * i)
    );
  }

  this.update = function (_img) {
    this.diffImg = _img;
    this.diffImg.loadPixels();

    for (var x = 0; x < this.diffImg.width; x += 1) {
      for (var y = 0; y < this.diffImg.height; y += 1) {
        var index = (x + y * this.diffImg.width) * 4;
        var state = diffImg.pixels[index + 0];

        if (state == 255) {
          var screenX = map(x, 0, this.diffImg.width, 0, this.worldWidth);
          var screenY = map(y, 0, this.diffImg.height, 0, this.worldHeight);
          var noteIndexX = int(screenX / this.noteWidth);
          var noteIndexY = int(screenY / this.noteWidth);
          var noteIndex = noteIndexX + noteIndexY * this.numOfNotesX;
          this.noteStates[noteIndex] = 1;
        }
      }
    }

    for (var i = 1; i < this.arrayLength; i++) {
      // *** set how long points take to disappear (decimal between 0 - 1)
      // Value needs to be "precise" to track the object nearest to the camera. Trial and error was mostly used to get right value
      this.noteStates[i] -= 0.65; 
      this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
    }

    this.draw();
  };

  this.draw = function () {
    push();
    noStroke();
    for (var x = 0; x < this.numOfNotesX / 2; x++) {
      for (var y = 0; y < this.numOfNotesY / 2; y++) {
        var posX = this.noteWidth / 2 + 2 * x * this.noteWidth;
        var posY = this.noteWidth / 2 + 2 * y * this.noteWidth;
        var noteIndex = x + y * this.numOfNotesX;

        if (this.noteStates[noteIndex] > 0) {
          fill(this.colorArray[noteIndex]);
          // *** change shape of point\
          // Value of 50 was chosen to balance shape spaces and clutter
          rect(posX, posY, camera.width / 50, camera.height / 50); 
        }
      }
    }
    pop();
  };
};
