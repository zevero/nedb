var Datastore = require('../lib/datastore')
  , testDb = 'workspace/test.db'
  , fs = require('fs')
  , path = require('path')
  , customUtils = require('../lib/customUtils')
  , should = require('chai').should()
  , assert = require('chai').assert
  , _ = require('underscore')
  ;


describe('Database', function () {
  beforeEach(function (done) {
    customUtils.ensureDirectoryExists(path.dirname(testDb), function () {
      fs.exists(testDb, function (exists) {
        if (exists) {
          fs.unlink(testDb, done);
        } else { return done(); }
      });
    });
  });

  it('Able to insert a document in the database and retrieve it even after a reload', function (done) {
    var d = new Datastore(testDb);
    d.loadDatabase(function (err) {
      assert.isNull(err);
      d.find({}, function (err, docs) {
        docs.length.should.equal(0);

        d.insert({ somedata: 'ok' }, function (err) {
          // The data was correctly updated
          d.find({}, function (err, docs) {
            assert.isNull(err);
            docs.length.should.equal(1);
            Object.keys(docs[0]).length.should.equal(2);
            docs[0].somedata.should.equal('ok');
            assert.isDefined(docs[0]._id);

            // After a reload the data has been correctly persisted
            d.loadDatabase(function (err) {
              d.find({}, function (err, docs) {
                assert.isNull(err);
                docs.length.should.equal(1);
                Object.keys(docs[0]).length.should.equal(2);
                docs[0].somedata.should.equal('ok');
                assert.isDefined(docs[0]._id);


                done();
              });
            });
          });
        });
      });
    });
  });

  it('Can insert multiple documents in the database', function (done) {
    var d = new Datastore(testDb);
    d.loadDatabase(function (err) {
      assert.isNull(err);
      d.find({}, function (err, docs) {
        docs.length.should.equal(0);

        d.insert({ somedata: 'ok' }, function (err) {
          d.insert({ somedata: 'another' }, function (err) {
            d.insert({ somedata: 'again' }, function (err) {
              d.find({}, function (err, docs) {
                docs.length.should.equal(3);
                _.pluck(docs, 'somedata').should.contain('ok');
                _.pluck(docs, 'somedata').should.contain('another');
                _.pluck(docs, 'somedata').should.contain('again');
                done();
              });
            });
          });
        });
      });
    });
  });

});