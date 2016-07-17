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

//var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var mongoClient;
var collection;
module.exports = function (config,client,db) {
  var url = config.mongodb.url;
  var collectionName = config.mongodb.collection_carts;
  mongoConnDb = db;
  mongoClient = client;
  collection = mongoConnDb.collection(collectionName);

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

  function getCollection (cb) {
    if (collection) {
      //setImmediate(function () {
        cb(null, collection);
      //});
      //return;
    }
    mongoClient.connect(url, function (err, db) {
      if (err) {
        return cb(err);
      }
      console.log('mongo connection established to '+url);
      collection = db.collection(collectionName);
      cb(null, collection);
    });
  }

  // [START list]
  function list (limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    console.log(token);
    if (isNaN(token)) {
      return cb(new Error('invalid token'));
    }
    getCollection(function (err, collection) {
      console.log('getcoll');
      if (err) {
        return cb(err);
      }
      collection.find({})
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
    getCollection(function (err, collection) {
      if (err) {
        return cb(err);
      }
      collection.insert(data, {w: 1}, function (err, result) {
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
    getCollection(function (err, collection) {
      if (err) {
        return cb(err);
      }
      var o_id = new ObjectID(id);
      collection.findOne({
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

  // [START update]
  function update (id, data, cb) {
    getCollection(function (err, collection) {
      if (err) {
        return cb(err);
      }
      collection.update(
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

  function list_ordered(limit,token,coordinates,order,cb){
    token = token ? parseInt(token, 10) : 0;
    console.log(token);
    if (isNaN(token)) {
      return cb(new Error('invalid token'));
    }
    getCollection(function (err, collection) {
      console.log('get list_ordered');
      if (err) {
        return cb(err);
      }

      collection.find(
        { "loc" :
         { $near :
            {
              $geometry : {
                 type : "Point" ,
                 coordinates :  ["40.750778", "74.005010" ]
               }
               ,$maxDistance : 1
            }
         }
        })
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

  function _delete (id, cb) {
    getCollection(function (err, collection) {
      if (err) {
        return cb(err);
      }
      collection.remove({
        _id: new ObjectID(id)
      }, cb);
    });
  }

  return {
    //create: create,
    //update: update,
    //delete: _delete,
    read: read,
    list: list,
    listOrdered: list_ordered
  };
};
