// myclasses.js
// ===========
const tools = require('./testtools.js');

class MapData {
  constructor(mapName, firstNodeId) {
    this.mapName = mapName;
    this.firstNodeId = firstNodeId;
    this.counter = 1;
    Object.assign(this, {
      increment() {
        this.counter++;
      },
      decrement() {
        if (this.counter > 0) this.counter--;
      },
      getCount() {
        return this.counter;
      },
    })
  }
}

class MapNode {
  // nodes start with no selections
  constructor(imageId, parentNodeId) {
    this.id = tools.uuidv4();
    this.imageId = imageId;
    this.parentNodeId = parentNodeId;
    this.selections = [];
  }
  addSelection(selection) {
    this.selections.push(selection);
  }
}

class Rectangle {
  constructor(x,y,height,width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }
}

class Selection {
  constructor(targetId, rectangle) {
    this.targetId = targetId;
    this.rectangle = rectangle;
  }
}

module.exports.MapData = MapData;
module.exports.MapNode = MapNode;
module.exports.Rectangle = Rectangle;
module.exports.Selection = Selection;
