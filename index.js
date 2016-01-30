"use strict";

process.title = 'faithgame';
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var port = process.env.PORT || 8080;

var games = [];

var saveToDatabase = function () {console.log("no database");};
var deleteFromDatabase = saveToDatabase;

app.use("/", express.static(__dirname + '/'));
app.use(bodyParser());
app.post('/newgame', function(req, res){
    console.log("new game saved");
    var data = JSON.parse(req.body.file);
    games[games.length] = data
    saveToDatabase(data);
    res.send('/play.html?p=' + (games.length - 1));
});

app.post("/remove", function(req, res) {
	/*console.log("removing a game");
	var gameToRemove = req.body.num;
	console.log("game removed locally: " + gameToRemove);
	res.send('ok');
	games.splice(gameToRemove, 1);
	deleteFromDatabase(req.body.num, req.body.pass);*/
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
	  var dbGames = database.collection('games');
	  dbGames.find(function (err, cursor) {
	    cursor.each(function (err, item) {
	      if (item != null) {
	      	console.log("loaded a game");
	        games.push(item);
	      }
	    });
	  });

	  saveToDatabase = function (data) {
  		dbGames.insert(data);
  		console.log("saved to db");
	  };

	  /*deleteFromDatabase = function (index, pass) {

	  	if (process.env.mongopass != pass) {
	  		console.log("Wrong password, not deleting from database");
	  		return;
	  	}

		dbGames.find(function (err, cursor) {
			var tempGames = [];
			cursor.each(function (err, item) {
			  if (item != null) {
			    tempGames.push(item);
			  }
			});
			console.log("removing from database: " + index)
			console.log(tempGames.length);
			var id = tempGames[parseInt(index)]._id;
		  	dbPosts.remove({"_id": id});
		  	console.log("removed a game");
		});
	  }*/
	});
}