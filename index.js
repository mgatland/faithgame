"use strict";

process.title = 'faithgame';
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var port = process.env.PORT || 8080;
var compliance = require('./compliance.js');
var games = [];
var gameSummaries = [];

var saveToDatabase = function () {console.log("no database");};
var deleteFromDatabase = saveToDatabase;

var addGame = function(game) {
	game.compliance = compliance.update(game);
	games.push(game);
	gameSummaries.push({thumbnail:game.canvasses[0], colorPalette:game.colorPalette, id:game._id, compliance: game.compliance});
}

app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/newgame', function(req, res){
    console.log("new game saved");
    var data = JSON.parse(req.body.file);
    addGame(data);
    saveToDatabase(data, games.length - 1);
    res.send('/play.html?p=' + (games.length - 1));
});

app.post("/remove", function(req, res) {
	var gameToRemove = req.body.num;
	res.send('ok');
	gameSummaries.forEach(function (summary, index) {
		if (summary.id == req.body.num) {
			games.splice(index, 1);
			gameSummaries.splice(index, 1);
			console.log("removing game number " + index + " with id " + req.body.num);
		}
	});
	deleteFromDatabase(req.body.num, req.body.pass);
});

app.get("/games", function(req, res){
	res.send(gameSummaries);
});

app.get("/game", function(req, res){
	console.log(req.query.id);
	res.send(games[req.query.id]);
});

console.log("Listening at port " + port)
app.listen(port);

var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

if (process.env.mongouser) {
var uri = "mongodb://" + process.env.mongouser + ":" + process.env.mongopass + "@ds051665.mongolab.com:51665/faithgame"

	mongodb.MongoClient.connect(uri, function(err, newdb) {
	  if(err) throw err;
	  console.log("yay we connected to the database");
	  var database = newdb;
	  var dbGames = database.collection('games');
	  dbGames.find(function (err, cursor) {
	    cursor.each(function (err, item) {
	      if (item != null) {
	      	console.log("loaded a game");
	        addGame(item);
	      }
	    });
	  });

	  saveToDatabase = function (data, gameIndex) {
  		dbGames.insert(data, function (err, saved) {
  			console.log("Saved game index " + gameIndex + " with id " + saved.ops[0]._id);
  			//add the new database id to the game summary
  			gameSummaries[gameIndex].id = saved.ops[0]._id;
  		});
  		console.log("saved to db");
	  };

	  deleteFromDatabase = function (index, pass) {

	  	if (process.env.mongopass != pass) {
	  		console.log("Wrong password, not deleting from database");
	  		return;
	  	}
	  	if (index == null || index == undefined || index == "") {
	  		console.log("nope");
	  		return;
	  	}
	  	console.log("removing from database too");
		dbGames.remove({"_id":ObjectId(index)});
	  }
	});
}