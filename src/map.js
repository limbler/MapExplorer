'use strict';

///////////// Initialization ///////////////////////

//initialize dropzone
Dropzone.autoDiscover = true;
Dropzone.options.mapDropzone = generateCustomDropzoneObject();

//Here we will keep a copy of all map data
var mapDataStore = {};
var currentNode;

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
      //alert(this.responseText);
      mapDataStore = JSON.parse(this.responseText);

    }
  };
  xhttp.open("GET", "map"+"?"+"mapname="+mapname, true);
  xhttp.send();

});

///////// State handling //////////////////

var edit_mode = false;
var draw_mode = false;
var ready_to_save = false;


////////// User Interaction //////////////////

function clickedEdit() {
  if (draw_mode) { return; }
  if (edit_mode)  { turn_edit_mode_off(); }
  else           { turn_edit_mode_on(); }
}

function clickedCreateSelection() {
  if (edit_mode) { return; }
  handleCreateSelection();
}

function clickedRectangle(evt) {

  if (draw_mode)
    return;

  var targetId = evt.target.getAttribute("targetId");
  if (!targetId) {
    alert ("Selection had no target Id");
    return;
  }
  // if edit_mode, delete the selection
  if (edit_mode) {
    deleteSelection(evt.target);
    return;
  }
  // Otherwise, find the next node and load it
  loadFromDataStore(mapDataStore, targetId);
}

function clickedCancelSave(evt) {
  cancelSaveSelection(evt);
}

function clickedCancelUpload(evt) {
  cancelUpload(evt);
}

///////// Draw new selections ///////////////////

// Grab our image to use as drawing board
var draw = SVG.adopt(document.getElementById('drawing-area-container'))
var rect = null;	// initialize variable
var newSelectionJson = '';

function handleCreateSelection() {
  if (!draw_mode) {
    // start creating the selection
    draw_mode = true;
    setButtonToCreating();
    ready_to_save = false;
    newSelectionJson = '';
    return;
  }
  if (!rect) {
    // if they haven't started making a selection yet, cancel it
    draw_mode = false;
    setButtonToDefaults();
    return;
  }
  // The rectangle is ready for saving
  // pop up a modal dialog for adding a file
  if (ready_to_save) {
    document.getElementById("hiddenModalLink").click();
    // build new rectangle string for saving
    var x = rect.attr("x");
    var y = rect.attr("y");
    var height = rect.attr("height");
    var width = rect.attr("width");

    newSelectionJson = "{ \"x\":\"" + x + "\", \"y\":\"" + y + "\", \"height\":\"" + height + "\", \"width\":\"" + width + "\"}";
    setToDefaults();
  }
}

function setToDefaults() {
  // if there's a selection in progress, kill it
  if (rect && !ready_to_save) {
      rect.remove();
  }
  rect = null;
  draw_mode = false;
  setButtonToDefaults();
}

draw.on('mousedown', function(event){
  if (!draw_mode || edit_mode) {
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

function cancelSaveSelection(evt) {
  removeLastSelection();
  setToDefaults();
}

//User cancels modal upload without uploading image
function cancelUpload(evt) {
  removeLastSelection();
  newSelectionJson = '';
}

////////// Handle Image Changes /////////////////

function loadFromDataStore(dataStore, nodeId) {
  var myNode = dataStore.nodes.filter(function (entry) { return entry.id === nodeId; })[0];
  if (!myNode) {
    alert("Error: Cant find node " + nodeId);
    //img.src = "./images/failedtoload_skinny_icon.png";
    return;
  }

  // Clear out any current selection objects
  clearRectangles();

  // Load new image and render
  var img = initializeImageObject();
  img.src = myNode.imageId;

  // Load up and render the selections
  myNode.selections.forEach(function(selection) {
    var srect = createSelectionRectangle( selection.rectangle.x,
                                          selection.rectangle.y,
                                          selection.rectangle.height,
                                          selection.rectangle.width );
    srect.setAttribute("targetId", selection.targetId);
    document.getElementById('drawing-area-container').appendChild(srect);
  })

  currentNode = myNode.id;
}

//////////////// Edit mode //////////////////////

function turn_edit_mode_on() {
  edit_mode = true;
  // darken picture slightly
  $('#drawing-area').css("opacity", "0.4");
    // All rectangles go to highlight mode/turn red on hover
  var rects = document.getElementsByClassName('map_selection');
  Array.prototype.forEach.call(rects,function(element) {
    element.classList.add("delete_selection");
  });

  // 'disable' other buttons
  var buttons = document.getElementsByClassName('button');
  Array.prototype.forEach.call(buttons,function(element) {
    element.classList.add("disabled-button");
  });

  // highlight edit button
  var editbutton = document.getElementById('edit_button');
  editbutton.classList.add("attention");
  editbutton.value = "Done";
  // Add white text "Click Selection to Delete"
}

function turn_edit_mode_off() {
  edit_mode = false;

  var rects = document.getElementsByClassName('map_selection');
  $('#drawing-area').css("opacity", "");
  Array.prototype.forEach.call(rects,function(element) {
    element.classList.remove("delete_selection");
  });

  var buttons = document.getElementsByClassName('button');
  Array.prototype.forEach.call(buttons,function(element) {
    element.classList.remove("disabled-button");
  });

  var editbutton = document.getElementById('edit_button');
  editbutton.classList.remove("attention");
  editbutton.value = "Edit...";
}

function deleteSelection(target) {
  var targetId = target.getAttribute("targetId");

  if (!verifyDelete()) {
    return;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      alert(this.responseText);
    }
  };
  xhttp.open("DELETE", "selection"+"?"+"mapname="+ mapDataStore.mapdata.mapName + "&targetid=" + targetId+ "&currentid=" + currentNode, true);
  xhttp.send();

  //TODO: move this into the http response
  target.parentNode.removeChild(target);
  return;
}


////////// PURE UTILITY FUNCTIONS /////////////////

function removeLastSelection() {
  var container = document.getElementById('drawing-area-container')
  if (container.lastChild.id != 'drawing-area')
    container.removeChild(container.lastChild);
}

function clearRectangles() {
  var rectangles = document.getElementsByClassName('map_selection');
  while(rectangles[0]) {
      rectangles[0].parentNode.removeChild(rectangles[0])
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
  document.getElementById('create_selection_button').value = "Creating Selection";
  document.getElementById('create_selection_button').classList.remove("attention");
  //mybutton.style.boxShadow = "0 0 15px #cc6533";
  document.getElementById('cancel_selection_button').style.display= "block";
}

function setButtonToSave() {
  var mybutton = document.getElementById('create_selection_button');
  mybutton.classList.add("attention");
  mybutton.value = "Save Selection";
}

function setButtonToDefaults() {
  var mybutton = document.getElementById('create_selection_button');
  mybutton.classList.remove("attention");
  mybutton.value = "Create Selection";
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
  var acceptButton = document.getElementById("accept_upload_button");
  acceptButton.classList.remove("activated");
  acceptButton.classList.add("unselected");
  $("#accept_upload_button").prop('onclick',null).off('click');
};
function activateAcceptButton() {
  var acceptButton = document.getElementById("accept_upload_button");
  acceptButton.classList.remove("unselected");
  acceptButton.classList.add("activated");
  // have to set the button activation in the dropzone itself
};

function closeModal() {
  window.location.hash='';
}

function validateUpload() {
  return true;
}

function appendUploadData(formData) {
  formData.append('currentNode', currentNode);
  formData.append('currentMap', mapDataStore.mapdata.mapName);
  formData.append('selection', newSelectionJson);
}

function verifyDelete() {
  if (confirm('Are you sure you want to delete this selection?')) {
    return true;
  } else {
    return false;
  }
}
