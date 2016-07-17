// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var path = require('path');
var express = require('express');
var config = require('./config')();


var app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

var mongoClient = require('mongodb').MongoClient;
var usermodel;
var model;

mongoClient.connect(config.mongodb.url, function (err, db) {
  if(err)
  {
    console.log('error connecting !!');
  }
  console.log('mongo connection established to '+config.mongodb.url);

  //Users
  usermodel = require('./user/model')(config,mongoClient,db);

  //Carts
  model = require('./carts/model')(config,mongoClient,db);

  app.use('/api/user', require('./user/api')(usermodel));
  app.use('/api/carts', require('./carts/api')(model));

  // Redirect root to /home
app.get('/', function (req, res) {
  res.redirect('/home');
});

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Ahh, Something broke!');
});

if (module === require.main) {
  // Start the server
  var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}

  console.log('done');
});
