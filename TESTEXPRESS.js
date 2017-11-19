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
  //destination: function (req, file, cb) {
  //  cb(null, '/tmp/my-uploads')
  //},
  filename: function (req, file, cb) {
    //Name each file with a new UUID ( this will be the official uuid for htat image)

    //Give it a new uuid but keep the file extension
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(file.originalname)[1];
    cb(null, tools.uuidv4() + "." + ext)
  }
});
const upload = multer( { storage:storage });

// Handle uploading a new file
app.post('/uploadfile', upload.single( 'file' ), function( req, res, next ) {

   if ( !req.file.mimetype.startsWith( 'image/' ) ) {
     return res.status( 422 ).json( {
       error : 'The uploaded file must be an image'
     } );
   }
   //var dimensions = sizeOf( req.file.path );
   var fileName = req.file.originalname;
   console.log('Uploading file ' + fileName + '!!!');
   console.log("filename: " + req.file.filename + "  originalname: " + req.file.originalname);

   //TODO: pull this from the filename where it's already been generated
   var newImageUuid = tools.uuidv4();
   //var newMapNode = new myClasses.MapNode(newImageUuid, currentUuid);

   return res.status( 200 ).send( req.file );
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
