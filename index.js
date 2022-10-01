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

console.log("Listening at port " + port)
app.listen(port);

app.get('/test', function(req, res) {
	res.send('ok')
})