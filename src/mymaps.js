'use strict';

Dropzone.autoDiscover = true;
Dropzone.options.newmapDropzone = generateCustomDropzoneObject();

$(function(){
  // Make GET request for the list of maps
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // obj is the list of maps
      var obj = JSON.parse(this.responseText);
      var firstNode = obj.maps[0].nodes.filter(function (entry) { return entry.id === obj.maps[0].mapdata.firstNodeId; });

      // set up our Vue handlers
      var app = new Vue({
        el: '#app',
        data: {
          message: '',
          maps: obj.maps
        },
        methods: {
          getImageFromNodeId(mapName, nodeId) {
            var mymap = this.maps.filter(function (entry) { return entry.mapdata.mapName === mapName; });
            var firstNode = mymap[0].nodes.filter(function (entry) { return entry.id === mymap[0].mapdata.firstNodeId; });
            return firstNode[0].imageId;
          },
          getNumberTiles(mapName) {
            var mymap = this.maps.filter(function (entry) { return entry.mapdata.mapName === mapName; });
            return mymap[0].nodes.length;
          },
          clickedDeleteMap(mapName) {

            if (verifyDelete(mapName)) {
              // delete map from server
              function sendDelete(maps, mapName) {
                var xhttp = new XMLHttpRequest();
                xhttp.open("DELETE", "map"+"?"+"mapname="+ mapName, true);

                xhttp.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                    alert("Deleted from server");

                    // Remove from maps panel
                    var mymap = maps.filter(function (entry) {
                      return entry.mapdata.mapName === mapName;
                    })[0];
                    if (mymap) {
                      var index = maps.indexOf(mymap);
                      if (index > -1) {
                          maps.splice(index, 1);
                      }
                    }
                  }
                };
                xhttp.send();
              }

              sendDelete(this.maps, mapName);

            }
          } //clickedDeleteMap
        } //methods
      })
    }
  };
  xhttp.open("GET", "mapList", true);
  xhttp.send();

});

function resetAcceptButton() {
  $("#accept_upload_button").removeClass("activated")
                           .addClass("unselected")
                           .prop('onclick',null).off('click');
};
function activateAcceptButton() {
  $("#accept_upload_button").removeClass("unselected")
                            .addClass("activated");
  // have to set the button activatio in the dropzone itself
};

function closeModal() {
  window.location.hash='';
  $('#mapname_input').val("");
}

function validateUpload() {
  if(!$('#mapname_input').val()) {
    alert("You forgot the title!");
    return false;
  }
  return true;
}
function appendUploadData(formData) {
  formData.append('mapTitle', $('#mapname_input').val());
}

//////////////// Edit mode //////////////////////
var edit_mode = false;

function clickedEdit() {
  if (edit_mode)  { turn_edit_mode_off(); }
  else           { turn_edit_mode_on(); }
  // TODO: turn on edit mode
}

function turn_edit_mode_on() {
  edit_mode = true;
  // darken map thumbnails
  $('.map-thumbnail-img').addClass("edit_mode");
  // display trash icons
  $('.icon-container').addClass("edit_mode");
  // Change edit button text
  $('#edit_button').val("Done");
}

function turn_edit_mode_off() {
  edit_mode = false;
  $('.map-thumbnail-img').removeClass("edit_mode");
  $('.icon-container').removeClass("edit_mode");
  $('#edit_button').val("Edit...");
}

function verifyDelete(mapName) {
  if (confirm('Are you sure you want to permanently delete map ' + mapName + '?')) {
    return true;
  } else {
    return false;
  }
}

function doneUploading() {
  alert("DONE UPLOADING")
  // Need to add the new map to the list
}
