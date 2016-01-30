"use strict";

process.title = 'faithgame';
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var port = process.env.PORT || 80;

var games = [];

var saveToDatabase = function () {console.log("no database");};

app.use("/", express.static(__dirname + '/'));
app.use(bodyParser());
app.post('/newgame', function(req, res){
    console.log("new game saved");
    var data = JSON.parse(req.body.file);
    games[games.length] = data
    saveToDatabase(data);
    res.send('ok');
});
app.get("/gamecount", function(req, res){
	res.send(""+games.length);
});
app.get("/game", function(req, res){
	console.log(req.query.id);
	res.send(games[req.query.id]);
});

app.listen(port);


var mongodb = require('mongodb');

if (process.env.mongouser) {
var uri = "mongodb://" + process.env.mongouser + ":" + process.env.mongopass + "@ds051665.mongolab.com:51665/faithgame"

	mongodb.MongoClient.connect(uri, function(err, newdb) {
	  if(err) throw err;
	  console.log("yay we connected to the database");
	  var database = newdb;
	  var dbPosts = database.collection('games');
	  dbPosts.find(function (err, cursor) {
	    cursor.each(function (err, item) {
	      if (item != null) {
	        games.push(item);
	      }
	    });
	  });

	  saveToDatabase = function (data) {
  		dbPosts.insert(data);
  		console.log("saved to db");
	  };
	});
}