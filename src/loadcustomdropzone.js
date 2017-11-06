function generateCustomDropzoneObject() {
  return {
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 0.5, // MB
    maxFiles: 1,
    addRemoveLinks: true,
    acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
    dictDefaultMessage: "Drop files here (or click here) to upload",
    dictResponseError: 'Server not Configured',
    accept: function(file, done) {
      if (file.name == "justinbieber.jpg") {
        done("Naha, you don't.");
      }
      else { alert("uploaded file!"); done(); }
    },
    init:function(){
      alert("Running!");
      var self = this;
      // config
      self.options.addRemoveLinks = true;
      self.options.dictRemoveFile = "Delete";
      //New file added
      self.on("addedfile", function (file) {
        console.log('new file added ', file);
      });
      // Send file starts
      self.on("sending", function (file) {
        console.log('upload started', file);
        $('.meter').show();
      });

      // File upload Progress
      self.on("totaluploadprogress", function (progress) {
        console.log("progress ", progress);
        $('.roller').width(progress + '%');
      });

      self.on("queuecomplete", function (progress) {
        $('.meter').delay(999).slideUp(999);
      });

      // On removing file
      self.on("removedfile", function (file) {
        console.log(file);
      });
    }
  };
};

function loadcustomdropzone() {
  Dropzone.options.myAwesomeDropzone = generateCustomDropzoneObject();
};

function loadcustomdropzone2() {
  Dropzone.options.myAwesomeDropzone2 = generateCustomDropzoneObject();
};
