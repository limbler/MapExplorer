const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer( {dest: 'uploads/' });
const tools = require('./testtools.js');

app.use(express.static(__dirname + '/src'));
app.use("/src", express.static(__dirname + '/src'));

app.use(bodyParser.urlencoded({extended:true}));
app.use (bodyParser.json());

// define the basic classes we'll need
class Map {
  constructor(mapName, firstImageId) {
    this.mapName = mapName;
    this.firstImageId = firstImageId;

    // this essentially makes counter private
    var counter = 1;
    Object.assign(this, {
      increment() {
        counter++;
      },
      decrement() {
        if (counter > 0) counter--;
      },
      getCount() {
        return counter;
      },
    })
  }
}

var sampleMap = new Map("Map1", tools.uuidv4());
console.log(sampleMap.getCount());
sampleMap.increment();
sampleMap.increment();
console.log(sampleMap.getCount());
sampleMap.count = 20;
console.log(sampleMap.getCount());

class MapNode {
  // nodes start with no selections
  constructor(imageId, parentId) {
    this.imageId = imageId;
    this.parentId = parentId;
    this.selections = [];
  }
  addSelection(selection) {
    this.selections.push(selection);
  }
}

class Selection {
  constructor(targetId, svg) {
    this.targetId = targetId;
    this.svg = svg;
  }
}

app.set('view engine', 'ejs');

var currentUuid = tools.uuidv4();

app.post('/uploadfile', upload.single( 'file' ), function( req, res, next ) {

  tools.foo();
  tools.bar();
  console.log("New uuid = " + tools.uuidv4());

  console.log('Mimetype ' + req.file.mimetype + '!');
   if ( !req.file.mimetype.startsWith( 'image/' ) ) {
     return res.status( 422 ).json( {
       error : 'The uploaded file must be an image'
     } );
   }

   //var dimensions = sizeOf( req.file.path );

   var fileName = req.file.originalname;
   console.log('Uploading file ' + fileName + '!');
   console.log("filename: " + req.file.filename + "  originalname: " + req.file.originalname);

   var newImageUuid = tools.uuidv4();
   var newMapNode = new MapNode(newImageUuid, currentUuid);

   return res.status( 200 ).send( req.file );
   // Use the mv() method to place the file somewhere on your server
   //startup_image.mv(__dirname + '/images/' + fileName + '.jpgTEST' , function(err) {
  //   if(err){
    //   console.log(err);
    // }else{
    //console.log("uploaded");
  //  }
    //});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
