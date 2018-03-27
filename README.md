### ATTENTION

You probably don't need this library, umzug has been updated to natively support [mongo migrations](https://github.com/sequelize/umzug#mongodbstorage) as of v2.1.

# umzug-mongo
[![NPM Package](https://badge.fury.io/js/umzug-mongo.svg)](https://www.npmjs.com/package/umzug-mongo)
[![Build Status](https://travis-ci.org/patrickhulce/umzug-mongo.svg?branch=master)](https://travis-ci.org/patrickhulce/umzug-mongo)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/umzug-mongo.svg)](https://david-dm.org/patrickhulce/umzug-mongo)

Umzug adapter for mongo migrations.


## Usage

Simply pass in your promise-compliant mongodb-core database or collection object.

```js
var Umzug = require('umzug');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/mydatabase').then(function (db) {
  var umzug = new Umzug({
    storage: 'umzug-mongo',
    storageOptions: {
      connection: db,
      collectionName: 'mymigrations', // defaults to 'migrations'
    },
  });

  return umzug.up();
});
```

or

```js
var Umzug = require('umzug');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/mydatabase').then(function (db) {
  var migrations = db.collection('migrations');
  var umzug = new Umzug({
    storage: 'umzug-mongo',
    storageOptions: {
      collection: migrations,
    },
    migrations: {
      params: [db]
    },
  });

  return umzug.up();
});
```
