// testtools.js
//========
module.exports = {
  foo: function () {
    console.log("In function foo!");
  },
  bar: function() {
    console.log("In function bar!");
  },
  // got from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // Should be fine for labeling things, but is not crypto quality
  uuidv4: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
