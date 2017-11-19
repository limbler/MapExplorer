'use strict';

Dropzone.autoDiscover = true;
Dropzone.options.mymapsDropzone = generateCustomDropzoneObject();

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
          }
        }
      })
    }
  };
  xhttp.open("GET", "mapList", true);
  xhttp.send();

});
