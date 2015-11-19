'use strict';

var test = require('tape');
var nock = require('nock');

var mkuser = require('..');

nock('http://localhost:5984')
  .put('/_users/org.couchdb.user:justuser').reply(201)
  .put('/_users/org.couchdb.user:userwithdb').reply(201)
  .put('/userdb').reply(201)
  .put('/userdb/_security').reply(200)
  .put('/_users/org.couchdb.user:userwithdbdefault').reply(201)
  .put('/userdbdefault').reply(201)
  .put('/userdbdefault/_security').reply(200);

test('creates a user', t => {
  mkuser('org.couchdb.user:justuser', {
    name: 'justuser',
    type: 'user',
    roles: [],
    password: 'super-secret'
  }, {
    baseUrl: 'http://localhost:5984',
  })
  .on('error', err => {
    t.assert(false);
  })
  .on('response', r => {
    t.assert(r.statusCode === 201);
    r.resume();
    t.end();
  });
});

test('creates a user and a database', t => {
  mkuser('org.couchdb.user:userwithdb', {
    name: 'userwithdb',
    type: 'user',
    roles: [],
    password: 'super-secret'
  }, {
    database: 'userdb',

    // This is the default security object used if you specify a database
    security: {
      admins: {
        names: ['domachine'], groups: []
      },
      members: {
        names: [], groups: []
      }
    },
    baseUrl: 'http://localhost:5984',
  })
  .on('error', err => {
    throw err;
  })
  .on('response', r => {
    t.assert(r.statusCode === 200);
    r.resume();
    t.end();
  });
});


test('creates a user and a database with default security', t => {
  mkuser('org.couchdb.user:userwithdbdefault', {
    name: 'userwithdbdefault',
    type: 'user',
    roles: [],
    password: 'super-secret'
  }, {
    database: 'userdbdefault',
    baseUrl: 'http://localhost:5984',
  })
  .on('error', err => {
    throw err;
  })
  .on('response', r => {
    t.assert(r.statusCode === 200);
    r.resume();
    t.end();
  });
});
