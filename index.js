"use strict";

process.title = 'faithgame';
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var port = process.env.PORT || 80;

var games = [];

app.use("/", express.static(__dirname + '/'));
app.use(bodyParser());
app.post('/newgame', function(req, res){
    console.log("new game saved");
    games[games.length] = JSON.parse(req.body.file); 
    res.send('ok');
});
app.get("/gamecount", function(req, res){
	res.send(""+games.length);
	res.set("Connection", "close");
});
app.get("/game", function(req, res){
	console.log(req.query.id);
	res.send(games[req.query.id]);
});

app.listen(port);