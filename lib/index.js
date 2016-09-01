var assert = require('assert');

var _ = require('lodash');
var redefine = require('redefine');

module.exports = new redefine.Class({
  constructor: function (options) {
    this.connection = _.get(options, 'storageOptions.connection');
    this.collectionName = _.get(options, 'storageOptions.collectionName', 'migrations');
    assert.ok(this.connection, 'umzug-mongo requires a mongo connection');
  },
  logMigration: function (name) {
    var migrations = this.connection.collection(this.collectionName);
    return migrations.insertOne({
      name: name,
      loggedAt: new Date(),
      rolledBack: false,
      rolledBackAt: null,
    });
  },
  unlogMigration: function (name) {
    var migrations = this.connection.collection(this.collectionName);
    var rollbackInfo = {rolledBack: true, rolledBackAt: new Date()};
    return migrations.updateOne({name: name, rolledBack: false}, {$set: rollbackInfo});
  },
  executed: function () {
    var migrations = this.connection.collection(this.collectionName);
    return migrations.
      find({rolledBack: false}).
      sort({name: 1}).
      toArray().
      then(function (records) {
        return _.map(records, 'name');
      });
  },
});
