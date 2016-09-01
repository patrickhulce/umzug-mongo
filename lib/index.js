var assert = require('assert');

var _ = require('lodash');
var redefine = require('redefine');

module.exports = new redefine.Class({
  constructor: function (options) {
    this.connection = _.get(options, 'storageOptions.connection');
    this.collection = _.get(options, 'storageOptions.collection');
    this.collectionName = _.get(options, 'storageOptions.collectionName', 'migrations');
    assert.ok(this.connection || this.collection, 'umzug-mongo requires a mongo connection');

    if (!this.collection) {
      this.collection = this.connection.collection(this.collectionName);
    }

    if (this.connection && _.get(options, 'migrations.params.length') === 0) {
      options.migrations.params.push(this.connection);
    }
  },
  logMigration: function (name) {
    return this.collection.insertOne({
      name: name,
      loggedAt: new Date(),
      rolledBack: false,
      rolledBackAt: null,
    });
  },
  unlogMigration: function (name) {
    var rollbackInfo = {rolledBack: true, rolledBackAt: new Date()};
    return this.collection.updateOne({name: name, rolledBack: false}, {$set: rollbackInfo});
  },
  executed: function () {
    return this.collection.
      find({rolledBack: false}).
      sort({name: 1}).
      toArray().
      then(function (records) {
        return _.map(records, 'name');
      });
  },
});
