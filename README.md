# cruddy-simple

Generic CRUD Node application implemented with [Koa](http://koajs.com/). Which takes configuration and provides CRUD
operations on a database. AWS DynamoDB is supported out of the box but there is no reason why the database cannot be
relational (SQL). All that is required to support this is a wrapper around the database connection that implements the
internal database contract see below.

## Features

 - Provided routes:
   * `GET /`
   * `GET /:id`
   * `GET /healthz`
   * `GET /schema`
   * `POST /`
   * `PUT /:id`
   * `DELETE /:id`
 - Performs database transactions with given [database wrapper](#database-wrapper) (`create`, `read`, `readById`,
 `update`, `delete`) at the correct routes
 - Supports caching with `eTag`
 - Validates content type to be `application/json`
 - Validates JSON against the resource JSON Schema
 - Validates the API with Swagger
 - Mounts Swagger docs at `/docs`
 - Secures unsafe methods (`PUT`, `POST`, `DELETE`) with basic auth
 - Logging
 - [Custom Routes](#custom-routes)
 - Custom Koa Middleware

## Installation

```sh
yarn add cruddy-simple
```

## Available APIs

```js
import { dynamoDb, server, Either, NotFoundError } from 'cruddy-simple';
```

### DynamoDb

A function that takes a database client

**`dynamoDb(client, params, createId)`**

| Param | Type | Description |
| --- | --- | --- |
| client | <code>Object</code> | The configured AWS Dynamo Client |
| params | <code>Object</code> | An object that contains any values needed by the AWS SDK |
| createId | <code>Function</code> | A function that is used to generate unique IDs for new resources |

### Server

**`server(config)`**

Config options:

- **host**: `String`. The hostname of the server

- **port**: `Number`. The port the server is to be ran on

- **resource**: `String`. The name of the resource endpoint i.e. `users`

- **schema**: `Object`. JSON Schema object representation of the resource being exposed

- **middleware**: `Array`. _An optional array of Koa middleware_

- **swaggerDoc**: `Object`. An object containing the swagger document to be exposed at `/docs`

- **credentials**: `Object`

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The basic auth name |
| pass | <code>String</code> | The basic auth password |

- **logger**: `Object`

| Param | Type | Description |
| --- | --- | --- |
| info | <code>Function</code> | Logging function for information |
| error | <code>Function</code> | Logging function of errors i.e. `Internal Server Error` |
| fatal | <code>Function</code> | Logging of fatal errors that cause the application to crash |

- **routes**: `Array`. _An optional array of route objects:_

| Param | Type | Description |
| --- | --- | --- |
| method | <code>String</code> | Method to add to the router i.e. `get` |
| path | <code>String</code> | Path of route at given method i.e. `/name/:name` |
| middleware | <code>Array</code> | An array of koa middleware functions |

- **db** `Object`

| Param | Type | Description |
| --- | --- | --- |
| create | <code>Function</code> | A function to create a resource in the table, used by `POST /` requests |
| read | <code>Function</code> | A function to read all resources in the table, used by `GET /` requests |
| readById | <code>Function</code> | A function to read a resource by an ID from the table, used by `GET /:id` requests |
| update | <code>Function</code> | A function to update a resource at an ID in the table, used by `PUT /:id` requests |
| delete | <code>Function</code> | A function to delete a resource in the table, used by `DELETE /:id` requests |

### Either

[Data.Either](http://docs.folktalejs.org/en/latest/api/data/either/Either.html) is used for the internal Either data
structure.

### NotFoundError

`NotFoundError(message)`

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | An optional message to attach to the error. Default: `Not Found` |

## Usage

```js
import AWS from 'aws-sdk';
import { dynamoDb, server } from 'cruddy-simple';

import schema from 'path/to/schema/user.json';
import swaggerDoc from 'path/to/swagger.json';

const logger = someLogger();
const uniqueId = someUuidGenerator();

const credentials = {
  name: 'joe',
  pass: 'blogs'
};

AWS.config.update({
  region: 'aws-region'
  endpoint: 'aws-endpoint',
});

const client = new AWS.DynamoDB.DocumentClient();
const params = { TableName: 'users' };

const db = dynamoDb(client, params, uniqueId);

const config = {
  host: 'localhost',
  port: 4000,
  resource: 'users',
  schema
  swaggerDoc,
  credentials,
  logger,
  db
};

server(config);
```

## Extending

### Database Wrapper

The database wrapper passed into the server must conform to the following contract:

``` js
// flow used for description only
interface Database {
  create(Resource): Either<Error, Resource>,
  read(): Either<Error, [Resource]>,
  readById(ID): Either<Error, Resource>,
  update(ID, Resource): Either<Error, Resource>,
  delete(ID): Either<Error, Unit>
}
```

#### Either

<details>

<summary>Usage</summary>
The Either monad is used to represent the outcome of operations on the database.

Encapsulating the success in:
 - `Either.Right`

 and the error in:
 - `Either.Left`

This encapsulates server errors or not found errors in a consistent manner resulting in the ability to `fold` over the
data structure with an error function (left) and a success function (right).

</details>

#### Error

<details>

<summary>Usage</summary>

The routes of the application understands two types of errors:
 - `Error` a native JavaScript error
 - `NotFoundError` an extension of a JavaScript Error with the added context of representing not found when a resource
 is not available in the database

</details>

#### [Example In-Memory Database](https://www.github.com/photobox/cruddy-simple/tree/master/src/persistence/inMemoryDb/index.js)

### Custom Routes

Each custom route will need to know how to resolve the request itself with an array of standard Koa middleware.
If you needed to do anything with a database then you should pass this into the middleware/s before
supplying the custom routes to the server.

Example custom get route:

```js
const getByNameMiddleware = db => async ctx => {
  const { name } = ctx.params;
  const result = await db.read();

  return result.fold(
    error => {
      return ctx.throw(500, error.message);
    },
    data => {
      return ctx.body = data.filter(item => item.name === name);
    }
  );
};

const logMiddleware = logger => async (ctx, next) => {
  logger.info(ctx.method);
  return next();
};

const routes = [
  {
    method: 'get',
    path: '/name/:name',
    // with single middleware
    middleware: [getByNameMiddleware(someDbWrapperOfYourChoice)]
  },
  {
    method: 'get',
    path: '/nameWithLog/:name',
    // with multiple middleware
    middleware: [
      logMiddleware(someLoggerOfYourChoice),
      getByNameMiddleware(someDbWrapperOfYourChoice)
    ]
  }
];

const config = {
  credentials,
  db,
  host,
  logger,
  port,
  resource,
  routes,
  schema,
  swaggerDoc
};

server(config);
```

#### WARNING ️⚠️

Any custom routes that match those supported by `cruddy-simple` ([here](#features)) will overwrite the default
behavior.

## License

MIT