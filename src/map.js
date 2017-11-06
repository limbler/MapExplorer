'use strict';

$(function(){
  loadcustomdropzone();

  //Set the viewbox attribute
  //var address = document.getElementById("map_picture").getAttribute('xlink:href');
  //var myPicture = new Image();
  //myPicture.src = address;
  //alert("picture height: " + myPicture.width);

  //$("#svgimage").viewBox([0, 0, myPicture.width, myPicture.height].join(" "));
  //shape = document.getElementbyId("svgimage");
  //shape.setAttribute("viewBox", "0 0 620 470");

  //alert(window.screen.height);
  //document.getElementById("map_element").style.maxWidth = window.screen.availWidth;
  //document.getElementById("map_element").style.maxHeight = window.screen.availHeight;

  //window.addEventListener('resize', resizeFunc, false);
  //function resizeFunc()
  //{
  //}
});

// Grab our image to use as drawing board
var draw = SVG.adopt(document.getElementById('svgimage'))
var rect = null;	// initialize variable

draw.on('mousedown', function(event){
    // If we are starting a new rectangle, initialize it
    // and start the drawing
    if (!rect) {
      rect = draw.rect();
      rect.attr({
          filter: 'url(#glow)',
          class: 'map_selection_highlight'
        })
      rect.draw(event);
    }
    // If we are finishing the rectangle,
    // Close it off and then set it to null
    // to signal we're ready for a new rectangle
    else {
      rect.attr({
          filter: 'url(#glow)',
          class: 'map_selection'
        })
      rect.draw(event);
      rect = null;
    }
});

var main_image = document.getElementById('map_picture');
//main_image.addEventListener("mousedown", startRectangle);
//main_image.addEventListener("mousemove", dragRectangle);
//main_image.addEventListener("mouseup", endRectangle);
var new_rectangle = null;

//main_image.addEventListener("mouseup", endRectangle);
var creating_selection = false;
var dragging_selection = false;
//var selections = [];

function generateNewRectangle() {
  // Create the svg element to manipulate
  var svgns = "http://www.w3.org/2000/svg";
  var rect = document.createElementNS(svgns, 'rect');
  rect.setAttributeNS(null, 'x', 0);
  rect.setAttributeNS(null, 'y', 0);
  rect.setAttributeNS(null, 'height', '0');
  rect.setAttributeNS(null, 'width', '0');
  rect.setAttributeNS(null, 'class', 'map_selection');
  rect.setAttributeNS(null, 'filter', 'url(#glow)');
  rect.setAttributeNS(null, 'onclick', "clickedRectangle(evt)");
  document.getElementById('svgimage').appendChild(rect);

  return rect;
}

function startRectangle(evt) {

  draw.rect().draw()	// Here we init a rectangle and start drawing it
  //if (creating_selection == false) {
  //  alert("Didn't click create selection first!")
  //  return;
  //}
  /*
  new_rectangle = generateNewRectangle();
  if (!new_rectangle) {
    alert("Rectangle didn't get instantiated!")
  }

  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var x = evt.clientX - dim.left;
  var y = evt.clientY - dim.top;
  new_rectangle.setAttributeNS(null, 'x', x);
  new_rectangle.setAttributeNS(null, 'y', y);

  dragging_selection = true;
  creating_selection = true;
  */
}

function dragRectangle(evt) {
  if (!creating_selection || !dragging_selection) {
    return;
  }
  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var mouse_x = evt.clientX - dim.left;
  var mouse_y = evt.clientY - dim.top;
  var current_x = new_rectangle.getAttribute('x');
  var current_y = new_rectangle.getAttribute('y');

  // if values are greater than top left corner, can just change width/height
  if (mouse_x > current_x) {
    var new_width = mouse_x - current_x;
    new_rectangle.setAttributeNS(null, 'width', new_width);
  }
  if (mouse_y > current_y) {
    var new_height = mouse_y - current_y;
    new_rectangle.setAttributeNS(null, 'height', new_height);
  }

  // if user is pulling backwards, e.g. rigth to left,
  // need to move the start corner to avoid things going negative
  // (which doesn't work for SVG)
  if (mouse_x < current_x ) {
    new_rectangle.setAttributeNS(null, 'x', mouse_x);
    new_rectangle.setAttributeNS(null, 'width', current_x - mouse_x);
  }
  if (mouse_y < current_y) {
    new_rectangle.setAttributeNS(null, 'y', mouse_y);
    new_rectangle.setAttributeNS(null, 'height', current_y - mouse_y);
  }

}

function endRectangle(evt) {
  creating_selection = false;
  dragging_selection = false;
  if (!creating_selection || !dragging_selection) {
    return;
  }
  new_rectangle.setAttributeNS(null, 'height', '50');
  new_rectangle.setAttributeNS(null, 'width', '50');
  document.getElementById('create_selection_button').style.background="purple";
}

function clickedCreateSelection() {
  //creating_selection = true;
  document.getElementById('create_selection_button').style.background="white";
}

function clickedImg(evt) {
  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var x = evt.clientX - dim.left;
  var y = evt.clientY - dim.top;
  alert("clicked image! x: "+x+" y:"+y);
}

function clickedRectangle(evt) {
  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var x = evt.clientX - dim.left;
  var y = evt.clientY - dim.top;
  alert("clicked rectangle! x: "+x+" y:"+y);
}
