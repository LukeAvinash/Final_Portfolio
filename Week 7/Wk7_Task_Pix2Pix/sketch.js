/* DN1010 Experimental Interaction, Ashley Hi 2026
 * Week 7 - Style Transfer
 * Pix2Pix
 * Model: https://github.com/dongphilyoo/pix2pix-ml5-demo
 */

// SIZE denotes the canvas size
// Note: Model was trained on 256x256px images, so input images must be a multiple of 256
const SIZE = 256;
let inputImg, inputCanvas, outputContainer, statusMsg, transferBtn, clearBtn;

function setup() {
  // Create a canvas
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class("border-box").parent("canvasContainer");

  // Display initial input image
  // *** change input image here by editing filename
  inputImg = loadImage("images/input_mimikyu.jpg", drawImage);

  // Select output div container - this is where the result appears on the DOM
  outputContainer = select("#output");

  // Reflect that model has loaded
  statusMsg = select("#status");

  // Select 'transfer' button html element
  transferBtn = select("#transferBtn");

  // Select 'clear' button html element
  clearBtn = select("#clearBtn");

  // Attach a mousePressed event to the 'clear' button
  clearBtn.mousePressed(function () {
    // When clear button is pressed, trigger clear canvas
    clearCanvas();
  });

  // Set drawing stroke to black
  stroke(0);
  pixelDensity(1);
}

// Draw on the canvas when mouse is pressed
function draw() {
  // Follow mouse to create line drawing
  if (mouseIsPressed) {
    strokeWeight(2);
    stroke(0);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

// Draw the input image to the canvas
function drawImage() {
  image(inputImg, 0, 0, SIZE, SIZE);

  // After input image is loaded, initialise a pix2pix method with a pre-trained model
  // *** change model here by editing filename
  ml5.pix2pix("models/edges2handbags_AtoB.pict").ready.then((model) => {
    // Show 'Model Loaded!' message
    statusMsg.html("Model Loaded!");

    // Call transfer function after the model is loaded
    transfer(model);

    // Attach a mousePressed event to the button
    transferBtn.mousePressed(function () {
      transfer(model);
    });
  });
}

// Clear the canvas (make background white)
function clearCanvas() {
  background(255);
}

function transfer(pix2pix) {
  // Update status message
  statusMsg.html("Applying Style Transfer...!");

  // pix2pix requires a canvas DOM element (p5.js canvas)
  const canvasElement = select("canvas").elt;

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement).then((result) => {
    // Clear output container
    outputContainer.html("");
    // Create an image based result
    createImg(result.src).class("border-box").parent("output");
    // Show 'Done!' message
    statusMsg.html("Done!");
  });
}
