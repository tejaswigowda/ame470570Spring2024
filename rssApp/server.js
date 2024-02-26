var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var MS = require("mongoskin");
var port = 8080;
var client = require('node-rest-client').Client;
var restClient = new client();

var dbserverip = process.argv.slice(2)[0]
console.log(dbserverip);
var db = MS.db("mongodb://" + dbserverip + ":27017/rssApp" , {native_parser: true});

app.get("/getFeed", function (req, res) {
    var url = req.query.url;
    restClient.get(url, function (data, response) {
        res.send(data);
    });
});

app.get("/editFeed", function (req, res) {
    var url = req.query.id;
    var name = req.query.name;
    db.collection('feeds').findOne({ _id: MS.helper.toObjectID(url) }, function (err, result) {
        result.name = name;
        db.collection('feeds').save(result, function (err, result) {
            res.send("ok");
        });
    });
});

app.get("/addFeed", function (req, res) {
    var url = req.query.url;
    console.log(url);
    var obj = {
        url: url,
        name: "Untitled",
        time: new Date().getTime()
    };

    db.collection('feeds').insert(obj, function (err, result) {
        db.collection('feeds').find().toArray(function (err, items) {
            res.send(items);
        });
    });
});

app.get("/getFeeds", function (req, res) {
    db.collection('feeds').find().toArray(function (err, items) {
        res.send(items);
    });
});

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);