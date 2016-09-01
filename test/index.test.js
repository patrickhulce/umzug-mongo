var _ = require('lodash');
var UmzugMongo = require('../lib');

describe('umzug.js', function () {
  var connectionApi = {collection: _.noop};
  var collectionApi = {insertOne: _.noop, updateOne: _.noop, find: _.noop};
  var cursorApi = {sort: _.noop, toArray: _.noop};
  var promiseApi = {then: _.noop};

  describe('#constructor', function () {
    it('should fail when connection is not set', function () {
      (function () {
        new UmzugMongo({});
      }).should.fail;
    });

    it('should succeed when connection is not set but collection is', function () {
      (function () {
        new UmzugMongo({collection: collectionApi});
      }).should.not.fail;
    });

    it('should default collectionName to migrations', function () {
      var obj = new UmzugMongo({storageOptions: {connection: connectionApi}});
      obj.should.have.property('collectionName', 'migrations');
    });

    it('should add the connection to migration params', function () {
      var options = {
        storageOptions: {connection: connectionApi},
        migrations: {params: []},
      };

      var obj = new UmzugMongo(options);
      obj.should.have.property('collection');
      options.should.have.deep.property('migrations.params.0', connectionApi);
    });

    it('should not add the connection to migration params if they are already set', function () {
      var params = [collectionApi, {}];
      var options = {
        storageOptions: {connection: connectionApi},
        migrations: {params: _.clone(params)},
      };

      var obj = new UmzugMongo(options);
      obj.should.have.property('collection');
      options.should.have.deep.property('migrations.params').eql(params);
    });

    it('should make a connection to collection', function () {
      var connection = _.clone(connectionApi);
      var collectionStub = sinon.stub(connection, 'collection').returns({hello: 'world'});
      var obj = new UmzugMongo({storageOptions: {connection: connection}});
      obj.should.have.property('collection').eql({hello: 'world'});
      collectionStub.should.have.been.calledWith('migrations');
    });
  });

  describe('#logMigration', function () {
    var plugin, insertOne;

    beforeEach(function () {
      var connection = _.clone(connectionApi);
      var collection = _.clone(collectionApi);

      sinon.stub(connection, 'collection').returns(collection);
      insertOne = sinon.stub(collection, 'insertOne');
      plugin = new UmzugMongo({storageOptions: {connection: connection}});
    });

    it('should insertOne with object', function () {
      plugin.logMigration('foobar');
      var arg = insertOne.firstCall.args[0];
      arg.should.have.property('name', 'foobar');
      arg.should.have.property('rolledBack', false);
      arg.should.have.property('loggedAt');
      arg.should.have.property('rolledBackAt');
    });
  });

  describe('#unlogMigration', function () {
    var plugin, updateOne;

    beforeEach(function () {
      var connection = _.clone(connectionApi);
      var collection = _.clone(collectionApi);

      sinon.stub(connection, 'collection').returns(collection);
      updateOne = sinon.stub(collection, 'updateOne');
      plugin = new UmzugMongo({storageOptions: {connection: connection}});
    });

    it('should updateOne with object', function () {
      plugin.unlogMigration('foobar');
      var query = updateOne.firstCall.args[0];
      var updates = updateOne.firstCall.args[1];
      query.should.have.property('name', 'foobar');
      query.should.have.property('rolledBack', false);
      updates.should.have.deep.property('$set.rolledBack', true);
      updates.should.have.deep.property('$set.rolledBackAt');
    });
  });

  describe('#executed', function () {
    var plugin, find, sort, promise;

    beforeEach(function () {
      var connection = _.clone(connectionApi);
      var collection = _.clone(collectionApi);
      var cursor = _.clone(cursorApi);

      promise = _.clone(promiseApi);
      plugin = new UmzugMongo({storageOptions: {collection: collection}});
      find = sinon.stub(collection, 'find').returns(cursor);
      sort = sinon.stub(cursor, 'sort').returns(cursor);
      sinon.stub(cursor, 'toArray').returns(promise);
    });

    it('should query with proper settings', function () {
      plugin.executed();
      find.should.have.been.calledWith({rolledBack: false});
    });

    it('should sort by name', function () {
      plugin.executed();
      sort.should.have.been.calledWith({name: 1});
    });

    it('should map the results', function () {
      var then = sinon.stub(promise, 'then');
      plugin.executed();
      var callback = then.firstCall.args[0];
      callback([{name: 'foo', loggedAt: new Date(), rolledBack: false}]).should.eql(['foo']);
    });
  });
});
