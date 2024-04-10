var url = require("url"),
	querystring = require("querystring");
var passport = require('passport');
var fs = require('fs');
	var dbURL = 'mongodb://127.0.0.1:27017/test';
var path = require('path'),
  express = require('express'),
  db = require('mongoskin').db(dbURL);
var client = require('node-rest-client').Client;
var restClient = new client();



var mongoose = require('mongoose');
mongoose.connect(dbURL); // connect to our database

var app = express();
var secret = 'test' + new Date().getTime().toString()

var session = require('express-session');
app.use(require("cookie-parser")(secret));
var MongoStore = require('connect-mongo')(session);
app.use(session( {store: new MongoStore({
   url: dbURL,
   secret: secret
})}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('express-flash');
app.use( flash() );

var bodyParser = require("body-parser");
var methodOverride = require("method-override");

app.use(methodOverride());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended:false
}));
require('./passport/config/passport')(passport); // pass passport for configuration
require('./passport/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

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

app.get("/deleteFeed", function (req, res) {
  var id = req.query.id;
  db.collection('feeds').remove({ _id: MS.helper.toObjectID(id) }, function (err, result) {
      db.collection('feeds').find().toArray(function (err1, items) {
          res.send(items);
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

  db.collection('feeds').insertOne(obj, function (err, result) {
      console.log(err);
      db.collection('feeds').find().toArray(function (err1, items) {
          res.send(items);
      });
  });
});

app.get("/getFeeds", function (req, res) {
  db.collection('feeds').find().toArray(function (err, items) {
      res.send(items);
  });
});


app.use(express.static(path.join(__dirname, 'public')));
app.listen(8080);

console.log("server running at http://localhost:8080")

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send('noauth');
}
