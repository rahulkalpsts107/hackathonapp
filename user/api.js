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

var express = require('express');
var bodyParser = require('body-parser');

module.exports = function (model) {
  var router = express.Router();

  // Automatically parse request body as JSON
  router.use(bodyParser.json());

  /**
   * POST /api/user
   *
   * Register a user
   */
  router.post('/', function list (req, res, next) {
    console.log('register in here');
    model.create(req.body, function (err, entity) {
      if (err) {
        return next(err);
      }
      res.json(entity);
    });
  });

  /**
   * GET /api/user/:fbid
   *
   * checks if the facebook id is already register, if not then return error else return object
   */
  router.get('/:fbid', function list (req, res, next) {
    console.log('check in here');
    model.read('5709306d2e81631e33b5ff61', function (err, entity) {
      if (err) {
        return next(err);
      }
      console.log(entity);
      res.json(entity);
    });
  });

  /**
   * Errors on "/api/carts/*" routes.
   */
  router.use(function handleRpcError (err, req, res, next) {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = {
      message: err.message,
      internalCode: err.code
    };
    next(err);
  });

  return router;
};
