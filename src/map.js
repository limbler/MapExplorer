'use strict';

//initialize dropzone
Dropzone.autoDiscover = true;
Dropzone.options.mapDropzone = generateCustomDropzoneObject();

//Here we will keep a copy of all map data
var mapDataStore = {};

// Initialize the page with the starting map image
$(function(){
  // Get The name of the map
  var parameters = location.search.substring(1)
  var temp = parameters.split("=");
  var mapname = unescape(temp[1]);
  if (!mapname) {
    alert("Oh no, couldn't get mapname from query parameters!");
    return;
  }

  $('#map_title').text(mapname);

  // Make a query to the server to get the first node of that map
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      loadFromDataStore(obj, obj.mapdata.firstNodeId);
      mapDataStore = JSON.parse(this.responseText);

    }
  };
  xhttp.open("GET", "map"+"?"+"mapname="+mapname, true);
  xhttp.send();

});

///////// Draw new selections ///////////////////

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
  else if (!rect) {
    // if they haven't started making a selection yet, cancel it
    creating_selection = false;
    setButtonToDefaults();
  }
  else {
    // The rectangle is ready for saving
    // pop up a modal dialog for adding a file
    document.getElementById("hiddenModalLink").click();
    setToDefaults();
  }
}

//User cancels modal upload without uploading image
function canceledUpload(evt) {
  // Remove the selection that was just created
  var container = document.getElementById('drawing-area-container')
  container.removeChild(container.lastChild);
}

function cancelSaveSelection(evt) {
  //Kill the created rectangle and reset button
  var container = document.getElementById('drawing-area-container')
  container.removeChild(container.lastChild);
  setToDefaults();
}

function setToDefaults() {
  // if there's a selection in progress, kill it
  if (rect && !ready_to_save) {
      rect.remove();
  }
  rect = null;
  creating_selection = false;
  setButtonToDefaults();
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
  // If starting a new rectangle, initialize and start drawing
  if (!rect) {
    rect = draw.rect();
    rect.attr({
        filter: 'url(#glow)',
        class: 'map_selection map_selection_highlight'
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


////////// Handle Image Changes /////////////////

function clickedRectangle(evt) {
  var targetId = evt.target.getAttribute("targetId");
  if (!targetId) {
    return;
  }
  // Find the next node and load it
  loadFromDataStore(mapDataStore, targetId);
}

function loadFromDataStore(dataStore, nodeId) {
  var myNode = dataStore.nodes.filter(function (entry) { return entry.id === nodeId; })[0];
  if (!myNode) {
    alert("Error: Cant find node " + nodeId);
    //img.src = "./images/failedtoload_skinny_icon.png";
    return;
  }

  // Clear out any current selection objects
  clearRectangles();

  // Load new image
  var img = initializeImageObject();
  img.src = myNode.imageId;

  // Load up the selections
  myNode.selections.forEach(function(selection) {
    var srect = createSelectionRectangle( selection.rectangle.x,
                                          selection.rectangle.y,
                                          selection.rectangle.height,
                                          selection.rectangle.width );
    srect.setAttribute("targetId", selection.targetId);
    document.getElementById('drawing-area-container').appendChild(srect);
  })
}


////////// PURE UTILITY FUNCTIONS /////////////////

function clearRectangles() {
  var paras = document.getElementsByClassName('map_selection');
  while(paras[0]) {
      paras[0].parentNode.removeChild(paras[0])
  }
}

function initializeImageObject() {
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
  return img;
}

function setButtonToCreating() {
  document.getElementById('create_selection_button').style.background="#222222";
  document.getElementById('create_selection_button').value = "Creating Selection";
  document.getElementById('create_selection_button').style.boxShadow = "0 0 15px #cc6533";
  document.getElementById('cancel_selection_button').style.display= "none";
}

function setButtonToSave() {
  document.getElementById('create_selection_button').style.background="#cc6533";
  document.getElementById('create_selection_button').value = "Save Selection";
  document.getElementById('create_selection_button').style.boxShadow = "0 0 15px #cc6533";
  document.getElementById('cancel_selection_button').style.display= "block";
}

function setButtonToDefaults() {
  document.getElementById('create_selection_button').style.background="#222222";
  document.getElementById('create_selection_button').value = "Create Selection";
  document.getElementById('create_selection_button').style.boxShadow = "none";
  document.getElementById('cancel_selection_button').style.display= "none";
}

function createSelectionRectangle(x,y,height,width) {
  var svgns = "http://www.w3.org/2000/svg";
  var srect = document.createElementNS(svgns, 'rect');
  srect.setAttributeNS(null, 'x', x);
  srect.setAttributeNS(null, 'y', y);
  srect.setAttributeNS(null, 'height', height);
  srect.setAttributeNS(null, 'width', width);
  srect.setAttributeNS(null, 'filter', 'url(#glow)');
  srect.setAttributeNS(null, 'class', 'map_selection');
  srect.setAttributeNS(null, 'onclick', 'clickedRectangle(evt)');
  return srect;
}

function resetAcceptButton() {
  var acceptButton = document.getElementById("accept_upload_button")
  acceptButton.classList.remove("activated");
  acceptButton.classList.add("unselected");
  $("#accept_upload_button").prop('onclick',null).off('click');
};
function activateAcceptButton() {
  var acceptButton = document.getElementById("accept_upload_button")
  acceptButton.classList.remove("unselected");
  acceptButton.classList.add("activated");
  // have to set the button activatio in the dropzone itself
};

function getUploadInfo() {
  var obj = {};
  obj.mapName = dataStore.mapdata.mapName;
  return obj;
}

function closeModal() {
  window.location.hash='';
}
