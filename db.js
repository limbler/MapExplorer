const jsonfile = require('jsonfile');
const myClasses = require('./myclasses.js');
const tools = require('./testtools.js');
//Load our map data (sample file) into memory
// Reference at https://www.npmjs.com/package/jsonfile
var datafile = './src/sampledata/data.json'
var dataStore = jsonfile.readFileSync(datafile);
if(!dataStore) {
  console.log("Failed to load data store at " + datafile + "!!");
  return;
}

function rewriteDataFile() {
  console.log("Writing out file " + datafile)
  jsonfile.writeFile(datafile, dataStore, function (err) {
    console.error(err)
  })
}

function getDataStore() {
  return dataStore;
}

function getMap(mapName) {
    var mymap = dataStore.maps.filter(function (entry) {
      return entry.mapdata.mapName === mapName;
    })[0];
    return mymap;
}

/////// ADDS ////////////////////////////////

function addNode(mapName, imageUUID, currentNode, selection) {
  var mymap = getMap(mapName);
  if (!mymap) {
    console.log('Cant find map ' + mapName);
    return false;
  }
  var currentNode = mymap.nodes.filter(function (entry) {
    return entry.id === currentNode;
  })[0];
  if (!currentNode) {
    console.log('Cant find node ' + currentNode);
    return false;
  }

  var newNodeUuid = tools.uuidv4();
  var newMapNode = new myClasses.MapNode(newNodeUuid, imageUUID, currentNode.id);
  mymap.nodes.push(newMapNode);

  var rectobj = JSON.parse(selection);
  var newRect = new myClasses.Rectangle(rectobj.x, rectobj.y, rectobj.height, rectobj.width);
  var newSelection = new myClasses.Selection(newNodeUuid, newRect);
  currentNode.selections.push(newSelection);

  rewriteDataFile();

  return true;
}

function addMap(mapTitle, imageUuid) {
  var newNodeId = tools.uuidv4();
  var newNode = new myClasses.MapNode(newNodeId, imageUuid, null);
  var newMap = new myClasses.MapData(mapTitle, newNodeId);
  var obj1 = {
    mapdata : newMap,
    nodes : []
  }
  obj1.nodes.push(newNode);
  dataStore.maps.push(obj1);

  rewriteDataFile();
}

//////// DELETES   /////////////////

function deleteMap(mapName) {
  var mymap = getMap(mapName);
  if (!mymap) {
      return false;
  }
  var index = dataStore.maps.indexOf(mymap);
  if (index > -1) {
    dataStore.maps.splice(index, 1);
  }

  rewriteDataFile();

  return true;
}

function deleteSelection(mapName, targetNode, currentNode) {
  var mymap = getMap(mapName);
  if (!mymap) {
    console.log("Could not find map " + mapName);
    return false;
  }
  // delete the corresponding selection from the current node
  var mycurrentnode = mymap.nodes.filter(function (entry) {
    return entry.id === currentNode;
  })[0];
  if (!mycurrentnode) {
    console.log("Could not find current node " + currentNode);
    return false;
  }
  var myselection = mycurrentnode.selections.filter(function (entry) {
    return entry.targetId === targetNode;
  })[0];
  if (!myselection) {
    console.log("Could not find selection");
    return false;
  }
  var index = mycurrentnode.selections.indexOf(myselection);
  if (index > -1) {
    mycurrentnode.selections.splice(index, 1);
  }

  function deleteNode(targetId) {
    var node = mymap.nodes.filter(function (entry) {
      return entry.id === targetId;
    })[0];
    if (node) {
      // get the list of selections to delete
      var selectionTargets = node.selections.map(a => a.targetId);
      // delete the node itself
      var index = mymap.nodes.indexOf(node);
      if (index > -1) {
        mymap.nodes.splice(index, 1);
      }
      // now delete the nodes for all the selections
      selectionTargets.forEach(function(item){
        deleteNode(item);
      });
    } else {
      console.log("Could not find node " + targetId + " to delete");
    }
  }

  // Recursively delete all target children
  deleteNode(targetNode);

  //TODO: consider deleting the image files associated with deleted nodes
  rewriteDataFile();
  return true;

}

module.exports.getDataStore = getDataStore;
module.exports.getMap = getMap;
module.exports.addMap = addMap;
module.exports.deleteMap = deleteMap;
module.exports.deleteSelection = deleteSelection;
module.exports.addNode = addNode;
