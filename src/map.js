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

function clickedGoBack() {
  if (draw_mode) { return; }
  if (edit_mode)  { turn_edit_mode_off(); }
  // find parent node
  var myNode = mapDataStore.nodes.filter(function (entry) {
    return entry.id === currentNode;
  })[0];
  if (!myNode) {
    alert("Error: Cant find current Node");
    return;
  }
  var parentNode = myNode.parentNodeId;
  if (parentNode) {
    //load the parent node
    loadFromDataStore(mapDataStore, parentNode);
  }
  else {
    // if we're at the top, return to MyMaps
    // this also works: window.location.replace("http://stackoverflow.com");
    window.location.href = "./mymaps.html";
    return;
  }
}

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
    // build new rectangle string for saving
    var x = rect.attr("x");
    var y = rect.attr("y");
    var height = rect.attr("height");
    var width = rect.attr("width");
    newSelectionJson = "{ \"x\":\"" + x + "\", \"y\":\"" + y + "\", \"height\":\"" + height + "\", \"width\":\"" + width + "\"}";

    document.getElementById("hiddenModalLink").click();

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
  $('.map_selection').addClass("delete_selection");
  // 'disable' other buttons
  $('.button').addClass("disabled-button");
  // highlight edit button
  $('#edit_button').removeClass("disabled-button")
                   .addClass("attention")
                   .val("Done");
  // Add white text "Click Selection to Delete"
}

function turn_edit_mode_off() {
  edit_mode = false;
  $('#drawing-area').css("opacity", "");
  $('.map_selection').removeClass("delete_selection");
  $('.button').removeClass("disabled-button");
  $('#edit_button').removeClass("attention")
                   .val("Edit...");
}

function deleteSelection(target) {
  var targetId = target.getAttribute("targetId");

  if (verifyDelete()) {
    function sendDelete(target) {
      var xhttp = new XMLHttpRequest();
      xhttp.open("DELETE", "selection"+"?"+
                  "mapname="+ mapDataStore.mapdata.mapName +
                  "&targetid=" + targetId+
                  "&currentid=" + currentNode, true);
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          // remove from view
          target.parentNode.removeChild(target);
        }
      };
      xhttp.send();
    }

    sendDelete(target);

    reloadDataFromServer();
  }
}

function doneUploading() {
  // Go ahead and reload the whole map
  reloadDataFromServer();
}

function reloadDataFromServer() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      loadFromDataStore(obj, currentNode); // stay on current node
      mapDataStore = JSON.parse(this.responseText);
    }
  };
  xhttp.open("GET", "map"+"?"+"mapname="+mapDataStore.mapdata.mapName, true);
  xhttp.send();
}

function validateUpload() {
  return true;
}

function appendUploadData(formData) {
  formData.append('currentNode', currentNode);
  formData.append('currentMap', mapDataStore.mapdata.mapName);
  formData.append('selection', newSelectionJson);
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
    $('#map_picture').attr("width", this.width)
                     .attr("height", this.height)
                     .attr("xlink:href", img.src);

    // Build a drawing area the same size as the image
    $('#drawing-area-container').attr("viewBox", viewboxstr)
                                .attr("width", this.width)
                                .attr("height", this.height);
    $('#drawing-area').attr("width", this.width)
                      .attr("height", this.height);
  }
  return img;
}

function setButtonToCreating() {
  $('#create_selection_button').val("Creating Selection")
                               .removeClass("attention");
  $('#cancel_selection_button').css("display", "block");
}

function setButtonToSave() {
  $('#create_selection_button').addClass("attention")
                               .val("Save Selection");
}

function setButtonToDefaults() {
  $('#create_selection_button').removeClass("attention")
                               .val("Create Selection");
  $('#cancel_selection_button').css("display", "none");
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
  $('#accept_upload_button').removeClass("activated")
                            .addClass("unselected");
  $("#accept_upload_button").prop('onclick',null).off('click');
};
function activateAcceptButton() {
  $('#accept_upload_button').removeClass("unselected")
                            .addClass("activated");
  // have to set the button activation in the dropzone itself
};

function closeModal() {
  window.location.hash='';
}

function verifyDelete() {
  if (confirm('Are you sure you want to delete this selection?')) {
    return true;
  } else {
    return false;
  }
}
