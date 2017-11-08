'use strict';

$(function(){
  loadcustomdropzone();

  //initialize my image
  var img = new Image();
  img.onload = function() {
    // Resize the SVG image to fit
    var viewboxstr = "0 0 " + this.width + " " + this.height;
    $('#svgimage').attr("viewBox", viewboxstr);
    $('#map_picture').attr("width", this.width);
    $('#map_picture').attr("height", this.height);
    $('#map_picture').attr("xlink:href", img.src);

    // Build a drawing area the same size as the image
    $('#drawing-area-container').attr("viewBox", viewboxstr);
    $('#drawing-area-container').attr("width", this.width);
    $('#drawing-area-container').attr("height", this.height);
    $('#drawing-area').attr("width", this.width);
    $('#drawing-area').attr("height", this.height);
  }
  //img.src = './images/worms.png';
  img.src = './images/bucky.jpg';
});

var creating_selection = false;

var ready_to_save = false;
// Grab our image to use as drawing board
var draw = SVG.adopt(document.getElementById('drawing-area-container'))
var rect = null;	// initialize variable

function clickedCreateSelection() {
  if (!creating_selection) {
    creating_selection = true;
    setButtonToCreating();
    ready_to_save = false;
  }
  else {
    // if there's a selection in progress, kill it
    if (rect && !ready_to_save) {
        rect.remove();
    }
    rect = null;

    // otherwise that rectangle is already nicely saved in teh SVG element.
    // pop up a modal dialog for adding a file
    document.getElementById("hiddenModalLink").click();
    //document.getElementById('mapModal').style.opacity = "1";
    //document.getElementById('mapModal').style.pointerEvents = "auto";
    creating_selection = false;
    setButtonToDefaults();
  }
}

draw.on('mousedown', function(event){

    if (!creating_selection) {
      return;
    }

    // if an unsaved rectangle already exists, delete it
    if (ready_to_save) {
      rect.remove();
      rect = null;
    }

    // If we are starting a new rectangle, initialize it
    // and start the drawing
    if (!rect) {
      rect = draw.rect();
      rect.attr({
          filter: 'url(#glow)',
          class: 'map_selection_highlight'
        })
      rect.draw(event);
      setButtonToCreating();
      ready_to_save = false;
    }
    // If we are finishing the rectangle,
    // Close it off and then set it to null
    // to signal we're ready for a new rectangle
    else {
      rect.attr({
          filter: 'url(#glow)',
          class: 'map_selection',
          onclick: 'clickedRectangle(evt)'
        })
      rect.draw(event);
      setButtonToSave();
      ready_to_save = true;
    }
});

function clickedRectangle(evt) {
  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var x = evt.clientX - dim.left;
  var y = evt.clientY - dim.top;
  //alert("clicked rectangle! x: "+x+" y:"+y);
}

function setButtonToCreating() {
  document.getElementById('create_selection_button').style.background="#222222";
  document.getElementById('create_selection_button').value = "Creating Selection";
  document.getElementById('create_selection_button').style.boxShadow = "0 0 15px #cc6533";
}

function setButtonToSave() {
  document.getElementById('create_selection_button').style.background="#cc6533";
  document.getElementById('create_selection_button').value = "Save Selection";
  document.getElementById('create_selection_button').style.boxShadow = "0 0 15px #cc6533";
}

function setButtonToDefaults() {
  document.getElementById('create_selection_button').style.background="#222222";
  document.getElementById('create_selection_button').value = "Create Selection";
  document.getElementById('create_selection_button').style.boxShadow = "none";
}
