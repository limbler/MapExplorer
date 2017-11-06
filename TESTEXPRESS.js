const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');;

app.use(express.static(__dirname + '/src'));
app.use("/src", express.static(__dirname + '/src'));

//app.get('/', function (req, res) {
//  res.sendFile('C:/Users/Laura/Code/MapExplorer/src/index.html');
//})

app.set('view engine', 'ejs');
app.use(fileUpload());

app.get('/inputFile', function(req, res){
  res.render('inputt');
});
app.post('/upload-file', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
   //var startup_image = req.files.foo;
   var fileName = req.body.file;
     console.log('Uploading file ' + fileName + '!');
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
