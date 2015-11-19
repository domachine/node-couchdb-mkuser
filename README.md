# couchdb-mkuser

[![Build Status](https://travis-ci.org/domachine/node-couchdb-mkuser.svg?branch=master)](https://travis-ci.org/domachine/node-couchdb-mkuser)

Utility to create couchdb users easier.

## Usage

In couchdb it's a common pattern to create a user with a database to store
user-private data.  Due to the lack of read access control of documents.  This
module makes it easy to create such a setup.

Use the following code to create a user and a database for the user.

```js
  mkuser('org.couchdb.user:userwithdb', {
    name: 'userwithdb',
    type: 'user',
    roles: [],
    password: 'super-secret'
  }, {
    database: 'userdb',

    // All options except `security` and `database` are passed to request.  See
    // https://github.com/request/request.
    baseUrl: 'http://localhost:5984',
  })
  .on('error', err => {
    throw err;
  })
  .on('response', r => {
    // Do something with the response.  E.g. pipe it down to the client.  In
    // this case it should be a 200 since the last action is the PUT to
    // /userdb/_security which should result in a 200.
  });
```

You can also leave out the database option to create a user document only.

## API

### mkuser(id, user, opts)

The `id` is the document-id of the user.  As of current couchdb versions it must
start with `org.couchdb.user:`.  `user` is the userobject to store.

`opts` is an object of options described below:

  * `database` *optional* The name of the database to create for the user.
    Leave this undefined if you don't want a database to be created.
  * `security` *optional* The security object to associate with the database.
    Default is
    ```
    security: {
      admins: {
        names: [<user-name>], groups: []
      },
      members: {
        names: [], groups: []
      }
    },
    ```

All other options are passed to [request](https://github.com/request/request).
