const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const multer = require('multer');
const jsonfile = require('jsonfile');
// Custom modules
const myClasses = require('./myclasses.js');
const tools = require('./testtools.js');

app.use(express.static(__dirname + '/src'));
app.use("/src", express.static(__dirname + '/src'));
app.use(bodyParser.urlencoded({extended:true}));
app.use (bodyParser.json());

app.set('view engine', 'ejs');

//Load our map data (sample file) into memory
// Reference at https://www.npmjs.com/package/jsonfile
var datafile = './src/sampledata/data.json'
var dataStore = jsonfile.readFileSync(datafile);
if(!dataStore) {
  console.log("Failed to load data store at " + datafile + "!!");
  return;
}

////// GET methods ///////////

// Return the full dataStore of maps
app.get('/mapList', function (req, res) {
  res.send(dataStore)
})

// Return the map object for the specified map
app.get('/map', function(req, res) {
  console.log("Map " + req.query.mapname + " was requested");
  //find the matching map in the datastore
  var mymap = dataStore.maps.filter(function (entry) { return entry.mapdata.mapName === req.query.mapname; });
  if (mymap[0]) {
    res.send(mymap[0]);
  }
  else {
    res.status(500).send({ error: 'Map " + req.query.mapname " cannot be found!' });
  }
})

/////// POST methods ///////

//Set up Multer for uploading files
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads')
  },
  filename: function (req, file, cb) {
    //Name each file with a new UUID ( this will be the official uuid for htat image)

    //Give it a new uuid but keep the file extension
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(file.originalname)[1];
    cb(null, tools.uuidv4() + "." + ext)
  }
});
const upload = multer( { storage:storage});

// Handle uploading a new file
app.post('/uploadfile', upload.single( 'file' ), function( req, res, next ) {
  console.log("req.body.userName = " + req.body.userName);

   // input validation
   if ( !req.file.mimetype.startsWith( 'image/' ) ) {
     return res.status( 422 ).json( {
       error : 'The uploaded file must be an image'
     } );
   }
   if (!req.body.currentNode || !req.body.currentMap || !req.body.selection) {
     return res.status( 422 ).json( {
       error : 'Missing Node Metadata'
     } );
   }
   var mymap = dataStore.maps.filter(function (entry) {
     return entry.mapdata.mapName === req.body.currentMap;
   })[0];
   if (!mymap) {
     return res.status( 422 ).json( {
       error : 'Cant find map ' + req.body.currentMap
     } );
   }
   var currentNode = mymap.nodes.filter(function (entry) {
     return entry.id === req.body.currentNode;
   })[0];
   if (!currentNode) {
     return res.status( 422 ).json( {
       error : 'Cant find node ' + req.body.currentNode
     } );
   }


   // pull auxiliary info
  console.log("filename: " + req.file.filename + "  originalname: " + req.file.originalname);
  console.log("req.body.currentNode = " + req.body.currentNode);
  console.log("req.body.currentMap = " + req.body.currentMap);
  console.log("req.body.selection = " + req.body.selection);

   //var dimensions = sizeOf( req.file.path );
   // generate a new UUID for this node
   var newImageUuid = "uploads/" + req.file.filename;
   var newNodeUuid = tools.uuidv4();
   var newMapNode = new myClasses.MapNode(newNodeUuid, newImageUuid, req.body.currentNode);
   mymap.nodes.push(newMapNode);

   // New image already has new UUID - it's the filename.
   // (temporarily have it as the path tho)
   //var newImageUuid = req.file.originalname;
   var rectobj = JSON.parse(req.body.selection);
   var newRect = new myClasses.Rectangle(rectobj.x, rectobj.y, rectobj.height, rectobj.width);
   var newSelection = new myClasses.Selection(newNodeUuid, newRect);
   currentNode.selections.push(newSelection);

   return res.status( 200 ).send( newNodeUuid );
});

app.post('/newmap', upload.single( 'file' ), function( req, res, next ) {
  if ( !req.file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'The uploaded file must be an image'
    } );
  }
  if (!req.body.mapTitle) {
    return res.status( 422 ).json( {
      error : 'Missing map title'
    } );
  }

  // pull map title
  console.log("req.body.mapTitle = " + req.body.mapTitle);

  var fileName = req.file.originalname;
  console.log('Uploading file ' + fileName + '!!!');
  console.log("filename: " + req.file.filename + "  originalname: " + req.file.originalname);

  // generate a new Map id
  var newImageUuid = tools.uuidv4();
   return res.status( 200 ).send( req.file );
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

////////  DELETES    /////////////////////////
app.delete('/selection', function( req, res) {
  console.log("delete: req.query: " + JSON.stringify(req.query));
  var mapName = req.query.mapname;
  var targetNode = req.query.targetid;
  var currentNode = req.query.currentid;

  console.log("Received request to delete node" + targetNode + " from " + mapName);
  var mymap = dataStore.maps.filter(function (entry) {
    return entry.mapdata.mapName === req.query.mapname;
  })[0];
  if (!mymap) {
      return res.status( 500 ).send("Could not find map " + mapName);
  }

  // delete the corresponding selection from the current node
  var mycurrentnode = mymap.nodes.filter(function (entry) {
    return entry.id === currentNode;
  })[0];
  if (!mycurrentnode) {
      return res.status( 500 ).send("Could not find current node " + currentNode);
  }
  var myselection = mycurrentnode.selections.filter(function (entry) {
    return entry.targetId === targetNode;
  })[0];
  if (!myselection) {
    return res.status( 500 ).send("Could not find selection");
  }
  var index = mycurrentnode.selections.indexOf(myselection);
  if (index > -1) {
    mycurrentnode.selections.splice(index, 1);
  }

  // delete the target node itself, and any descendent nodes.
  // kinda gotta search recursively, since each node only
  // has info on the parent nodes
  var mytargetnode = mymap.nodes.filter(function (entry) {
    return entry.id === targetNode;
  })[0];
  var index = mymap.nodes.indexOf(mytargetnode);
  if (index > -1) {
    mymap.nodes.splice(index, 1);
  }
  if (!mytargetnode) {
      return res.status( 500 ).send("Could not find target node " + mytargetnode);
  }

  var myparentnode = targetNode;

//Yeesh this will be hard. Lets leave this as a todo....
//TODO: Delete all descendent nodes
// May ultimately want to rethink my data formats
  //var mychildnodes = mymap.nodes.filter(function (entry) {
  //  return entry.parentNodeId === myparentnode;
  //}[0]);
  //TODO: consider deleting the image files associated with deleted nodes

  return res.status( 200 ).send(targetNode);
})
