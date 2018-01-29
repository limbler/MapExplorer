exports.index = function (req, res) {
    res.sendFile(__dirname + "./src/index.html");
}
