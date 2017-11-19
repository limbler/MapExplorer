const myClasses = require('../../myclasses.js');
const jsonfile = require('jsonfile');
const tools = require('../../testtools.js');

// Map1
var map1Node1 = new myClasses.MapNode("sampledata/bucky1.jpg", null);
var map1Node2 = new myClasses.MapNode("sampledata/bucky2.jpg", map1Node1.id);
var map1Node3 = new myClasses.MapNode("sampledata/bucky3.jpg", map1Node2.id);

var map1Node1R1 = new myClasses.Rectangle(10,10,200,200);
var map1Node2R1 = new myClasses.Rectangle(30,10,200,300);
var map1Node1S1 = new myClasses.Selection(map1Node2.id, map1Node1R1);
var map1Node2S1 = new myClasses.Selection(map1Node3.id, map1Node2R1);
map1Node1.selections.push(map1Node1S1);
map1Node2.selections.push(map1Node2S1);

var sampleMap1 = new myClasses.MapData("Map1-Bucky", map1Node1.id);
sampleMap1.increment();
sampleMap1.increment();
sampleMap1.increment();

var nodes1 = [];
nodes1.push(map1Node1);
nodes1.push(map1Node2);
nodes1.push(map1Node3);

var obj1 = {
  mapdata : sampleMap1,
  nodes : nodes1
}

//Map2
var map2Node1 = new myClasses.MapNode("sampledata/cap1.jpg", null);
var map2Node2 = new myClasses.MapNode("sampledata/cap2.jpg", map2Node1.id);
var map2Node3 = new myClasses.MapNode("sampledata/cap3.jpg", map2Node2.id);

var map2Node1R1 = new myClasses.Rectangle(10,10,200,200);
var map2Node2R1 = new myClasses.Rectangle(30,10,200,300);
var map2Node1S1 = new myClasses.Selection(map2Node2.id, map2Node1R1);
var map2Node2S1 = new myClasses.Selection(map2Node3.id, map2Node2R1);
map2Node1.selections.push(map2Node1S1);
map2Node2.selections.push(map2Node2S1);

var sampleMap2 = new myClasses.MapData("Map2-CaptainAmerica", map2Node1.id);
sampleMap2.increment();
sampleMap2.increment();
sampleMap2.increment();
var nodes2 = [];
nodes2.push(map2Node1);
nodes2.push(map2Node2);
nodes2.push(map2Node3);

var obj2 = {
  mapdata : sampleMap2,
  nodes : nodes2
}

//Map4
var map3Node1 = new myClasses.MapNode("sampledata/widow1.jpg", null);
var map3Node2 = new myClasses.MapNode("sampledata/widow2.jpg", map3Node1.id);
var map3Node3 = new myClasses.MapNode("sampledata/widow3.jpg", map3Node2.id);

var map3Node1R1 = new myClasses.Rectangle(10,10,200,200);
var map3Node2R1 = new myClasses.Rectangle(30,10,200,300);
var map3Node3R1 = new myClasses.Rectangle(50,10,300,300);
var map3Node1S1 = new myClasses.Selection(map3Node2.id, map3Node1R1);
var map3Node2S1 = new myClasses.Selection(map3Node3.id, map3Node2R1);
var map3Node3S1 = new myClasses.Selection("Junk", map3Node3R1);
map3Node1.selections.push(map3Node1S1);
map3Node2.selections.push(map3Node2S1);
map3Node3.selections.push(map3Node3S1);

var sampleMap3 = new myClasses.MapData("Map3-BlackWidow", map3Node1.id);
sampleMap3.increment();
sampleMap3.increment();
sampleMap3.increment();
var nodes3 = [];
nodes3.push(map3Node1);
nodes3.push(map3Node2);
nodes3.push(map3Node3);

var obj3 = {
  mapdata : sampleMap3,
  nodes : nodes3
}

//Combine the maps into a single Object
var maps = [];
maps.push(obj1);
maps.push(obj2);
maps.push(obj3);
var outobj = {
  maps: maps
}

var filename = './data.json'

console.log("Writing out file " + filename)
jsonfile.writeFile(filename, outobj, function (err) {
  console.error(err)
})

console.log("Reading file back in");
jsonfile.readFile(filename, function(err, obj) {
  console.log("First node id: " + obj.maps[0].nodes[0].id);
})
