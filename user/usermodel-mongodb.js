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

//'use strict';

var ObjectID = require('mongodb').ObjectID;
var mongoClient;
var mongoConnDb;
var collectionObject;

module.exports = function (config,client,db) {
  var url = config.mongodb.url;
  var collectionUserName = config.mongodb.collection_users;
  mongoClient = client;
  mongoConnDb = db;
  collectionObject = mongoConnDb.collection(collectionUserName);

  // [START translate]
  function fromMongo (item) {
    if (Array.isArray(item) && item.length) {
      item = item[0];
    }
    item.id = item._id;
    delete item._id;
    return item;
  }

  function toMongo (item) {
    delete item.id;
    return item;
  }
  // [END translate]

  function getUserCollection (cb) {
    if (collectionObject) {
      //setImmediate(function () {
        cb(null, collectionObject);
      //});
      //return;
    }
  }

  // [START list]
  function list (limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    console.log(token);
    if (isNaN(token)) {
      return cb(new Error('invalid token'));
    }
    getUserCollection(function (err, collectionObject) {
      console.log('getcoll');
      if (err) {
        return cb(err);
      }
      collectionObject.find({})
        .skip(token)
        .limit(limit)
        .toArray(function (err, results) {
          if (err) {
            return cb(err);
          }
          var hasMore =
            results.length === limit ? token + results.length : false;
          cb(null, results.map(fromMongo), hasMore);
        });
    });
  }
  // [END list]

  // [START create]
  function create (data, cb) {
    getUserCollection(function (err, collectionObject) {
      if (err) {
        return cb(err);
      }
      collectionObject.insert(data, {w: 1}, function (err, result) {
        if (err) {
          return cb(err);
        }
        var item = fromMongo(result.ops);
        cb(null, item);
      });
    });
  }
  // [END create]

  function read (id, cb) {
    getUserCollection(function (err, collectionObject) {
      if (err) {
        return cb(err);
      }

      var o_id = new ObjectID(id);
      collectionObject.findOne({
         '_id': o_id
      }, function (err, result) {
        if (err) {
          return cb(err);
        }
        if (!result) {
          return cb({
            code: 404,
            message: 'Not found'
          });
        }
        cb(null, fromMongo(result));
      });
    });
  }

  function read_fb_ (id, cb) {
    getUserCollection(function (err, collectionObject) {
      if (err) {
        return cb(err);
      }
      console.log(collectionObject)
      console.log('find id '+id.toString());
      console.log('in hereXX');// "_id":new ObjectID("5708ff882387222feb4672be"),
      collectionObject.findOne({
        //"fbid":id
      }, function (err, result) {
        console.log(err);
        console.log(result)
        if (err) {
          return cb(err);
        }
        if (!result) {
          return cb({
            code: 404,
            message: 'Not found'
          });
        }
        cb(null, fromMongo(result));
      });
    });
  }

  // [START update]
  function update (id, data, cb) {
    getUserCollection(function (err, collectionObject) {
      if (err) {
        return cb(err);
      }
      collectionObject.update(
        { _id: new ObjectID(id) },
        { '$set': toMongo(data) },
        { w: 1 },
        function (err) {
          if (err) {
            return cb(err);
          }
          return read(id, cb);
        }
      );
    });
  }
  // [END update]

  function _delete (id, cb) {
    getUserCollection(function (err, collectionObject) {
      if (err) {
        return cb(err);
      }
      collectionObject.remove({
        _id: new ObjectID(id)
      }, cb);
    });
  }

  return {
    //create: create,
    read: read,
    //update: update,
    //delete: _delete,
    read_fb: read_fb_
    //list: list
  };
};
