'use strict';

var http = require('http');
var EventEmitter = require('events');
var request = require('request');
var es = require('event-stream');
var xtend = require('xtend');
var mkdb = require('couchdb-mkdb');

/**
 * `couchdb-mkuser` makes it easy to create a user and create an optional user
 * database in couchdb.
 */
module.exports = (id, user, opts) => {
  let database = opts.database;
  let security = opts.security;
  let emitter = new EventEmitter();
  delete opts.database;
  delete opts.security;

  process.nextTick(create);
  return emitter;

  function create() {
    es.readable(function(count, next) {

      // Create the user document
      request.put('/_users/' + id, xtend(opts, {json: user}))
        .on('error', next)
        .on('response', r => {
          if (r.statusCode !== 201) return next(r);
          this.emit('data', r);
          this.emit('end');
        });
    })
    .on('error', handleError)
    .pipe(es.map((r, next) => {

      // Go on if the user doesn't want a user database
      if (!database) return next(null, r);

      // Otherwise pull out the response data
      r.resume();
      mkdb(database, xtend(opts, {
        security: security || {
          admins: {names: [user.name], groups: []},
          members: {names: [], groups: []}
        }
      }))
      .on('error', next)
      .on('response', r => {
        if (r.statusCode !== 200) return next(r);
        next(null, r);
      });
    }))
    .on('error', handleError)
    .on('data', r => emitter.emit('response', r));
  }

  // Throw occuring errors onto the emitter
  function handleError(err) {
    if (err instanceof http.IncomingMessage) {
      return emitter.emit('response', err);
    }
    emitter.emit('error', err);
  }
};
