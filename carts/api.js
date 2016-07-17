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
   * GET /api/carts
   *
   * Retrieve a page of carts (up to ten at a time).
   */
  router.get('/', function list (req, res, next) {
    console.log('in root here');
    var offset = req.query.pageToken ? req.query.pageToken: 0;
    model.list(10, offset, function (err, entities, cursor) {
      if (err) {
        return next(err);
      }
      res.json({
        items: entities,
        nextPageToken: cursor
      });
    });
  });

  /**
   * GET /api/carts/sort?longitude=xx&latitude=yy&order=asc
   *
   * Retrieve a page of carts (up to ten at a time) based on Sort by ascending or descending based on input order.
   * order can be 'asc' or 'des'
   */
    router.get('/sort', function list (req, res, next) {
      console.log('in here sort' + req.params.order);
      var offset = req.query.pageToken ? req.query.pageToken: 0;
      var longitude = req.query.longitude;
      var latitude = req.query.latitude;
      var order = req.query.order;
      var coords = [];  //"coordinates": [40.750778, -74.005010],
      coords[0] = longitude || 0;  
      coords[1] = latitude || 0;  
      console.log('longitude= '+longitude + 'latitude '+latitude + 'coords' + coords+'order' + order+'\n');
      if(order == 'asc' || order == 'des')
      {
        model.listOrdered(10,offset,coords,order, function (err, entities, cursor) {
          if (err) {
            return next(err);
          }
          res.json({
            items: entities,
            nextPageToken: cursor
          });
        });
      }
  });

  /**
   * GET /api/carts/:cartid
   *
   * Retrieve a page of carts (up to ten at a time).
   */
  router.get('/:cartid', function list (req, res, next) {
    model.read(req.params.cartid, function (err, entity) {
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
