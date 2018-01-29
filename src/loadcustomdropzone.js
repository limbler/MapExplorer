function generateCustomDropzoneObject() {
  return {
    paramName: 'file', // The name that will be used to transfer the file
    maxFilesize: 2, // MB
    maxFiles: 1,
    addRemoveLinks: true,
    acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
    dictDefaultMessage: "Drop files here (or click) to upload",
    dictResponseError: 'Server not Configured',
    autoProcessQueue: false,
    thumbnailWidth: 300,
    thumbnailHeight: 300,

    accept: function(file, done) {
      file.acceptDimensions = done;
      file.rejectDimensions = function() {
        done('Image must be at least 300 by 300 pixels in size');
      };
      console.log("uploaded file!");
      done();
    },
    init:function(){
      resetAcceptButton();

      var self = this;
      // config
      self.options.addRemoveLinks = true;
      self.options.dictRemoveFile = "Delete";
      //check dimensions
      this.on('thumbnail', function(file) {
        if (file.width < 300 || file.height < 300) {
          file.rejectDimensions();
        }
        else {
          //file.acceptDimensions();
        }
      });
      //New file added
      self.on("addedfile", function (file) {
        // remove existing file
        if (this.files.length) {
            var i, len;
            for (i = 0, len = this.files.length; i < len - 1; i++) // -1 to exclude current file
            {
                this.removeFile(this.files[i]);
            }
        }
        activateAcceptButton();
        var dropzone = this;
        $(".conditionalButton").click(function() {
          // dropzone users must define this themselves
           if (!validateUpload())
            return;
           dropzone.processQueue();
        });

        console.log('new file added ', file);
      });
      // Send file starts
      self.on("sending", function (file, xhr, formData) {
        // dropzone users must define this themselves
        appendUploadData(formData);
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
      // File successfully uploaded
      self.on("success", function(file, responseText) {
        console.log("Successfully uploaded file " + file + "!!");
        resetAcceptButton();
        // Give a short timeout for user experience.
        // have to make the 'removefile' timeout a little longer
        // to accound for the modal fadeout
        setTimeout(function() {closeModal();}, 1200);
        var dropzone = this;
        setTimeout(function() {
          dropzone.removeFile(file);
        }, 2000, file);

        doneUploading();

      });
      // File was rejected/failed
      self.on("error", function (file) {
        console.log("Error with file " + file);
        resetAcceptButton();
      });
      // On removing file
      self.on("removedfile", function (file) {
        console.log("removing file " + file + " from dropzone");
        resetAcceptButton();
      });
    }
  };
};
