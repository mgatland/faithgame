"use strict";

process.title = 'faithgame';
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var port = process.env.PORT || 8080;

console.log('dir ' + __dirname)
app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

console.log("Trying to listen at port " + port)
app.listen(port, () => console.log('listening on port ' + port))

app.get('/test', function(req, res) {
	res.send('ok')
})

app.get("/", (req, res) => res.type('html').send(html));
const html = `hello`