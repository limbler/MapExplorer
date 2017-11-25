const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const multer = require('multer');
// Custom modules
const myClasses = require('./myclasses.js');
const tools = require('./testtools.js');
const db = require('./db.js')

app.use(express.static(__dirname + '/src'));
app.use("/src", express.static(__dirname + '/src'));
app.use(bodyParser.urlencoded({extended:true}));
app.use (bodyParser.json());

app.set('view engine', 'ejs');

////// GET methods ///////////

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/src/index.html");
});
app.get('/mymaps', function(req, res) {
  res.sendFile(__dirname + "/src/mymaps.html");
});
app.get('/about', function(req, res) {
  res.sendFile(__dirname + "/src/about.html");
});
app.get('/mappage', function(req, res) {
  res.sendFile(__dirname + "/src/map.html");
});


// Return the full dataStore of maps
app.get('/mapList', function (req, res) {
  res.send(db.getDataStore())
})

// Return the map object for the specified map
app.get('/map', function(req, res) {
  console.log("Map " + req.query.mapname + " was requested");
  //find the matching map in the datastore
  var mymap = db.getMap(req.query.mapname);
  if (mymap) {
    res.send(mymap);
  }
  else {
    res.status(500).send({ error: 'Map ' + req.query.mapname + ' cannot be found!' });
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

  // pull auxiliary info
  console.log("filename: " + req.file.filename + "  originalname: " + req.file.originalname);
  console.log("req.body.currentNode = " + req.body.currentNode);
  console.log("req.body.currentMap = " + req.body.currentMap);
  console.log("req.body.selection = " + req.body.selection);

  // input validation
  if ( !req.file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json({error : 'The uploaded file must be an image'});
  }
  if (!req.body.currentNode || !req.body.currentMap || !req.body.selection) {
    return res.status( 400 ).json({error : 'Missing Node Metadata'});
  }

   //var dimensions = sizeOf( req.file.path );
   var newImageUuid = "uploads/" + req.file.filename;
   if (!db.addNode(req.body.currentMap, newImageUuid, req.body.currentNode,req.body.selection)) {
      return res.status( 500 ).send( "Failed to add new node" );
   }
   return res.status( 200 ).send( "New node added!" );
});

app.post('/map', upload.single( 'file' ), function( req, res, next ) {
  if ( !req.file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'The uploaded file must be an image'
    } );
  }
  var mapTitle = req.body.mapTitle;
  if (!mapTitle) {
    return res.status( 400 ).json( {error : 'Missing map title'} );
  }
  console.log("Adding new map : " + mapTitle);

  var newImageUuid = "uploads/" + req.file.filename;
  db.addMap(mapTitle, newImageUuid);

  return res.status( 200 ).send( req.file );
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

////////  DELETES    /////////////////////////
app.delete('/map', function( req, res) {
  console.log("delete: req.query: " + JSON.stringify(req.query));
  var mapName = req.query.mapname;
  if (!db.deleteMap(mapName)) {
    return res.status( 500 ).send("Server Error - Could not delete map " + mapName);
  }
  return res.status( 200 ).send(mapName);
})

app.delete('/selection', function( req, res) {
  console.log("delete: req.query: " + JSON.stringify(req.query));
  var mapName = req.query.mapname;
  var targetNode = req.query.targetid;
  var currentNode = req.query.currentid;
  if (!mapName || !targetNode || !currentNode) {
    return res.status( 400 ).send("Missing parameters");
  }

  console.log("Received request to delete node" + targetNode + " from " + mapName);

  if (!db.deleteSelection(mapName, targetNode, currentNode)) {
    return res.status( 500 ).send("Could not delete selection");
  }

  return res.status( 200 ).send(targetNode);
})
