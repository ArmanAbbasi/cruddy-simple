# cruddy-simple

Generic CRUD Node application. Which takes configuration and provides CRUD operations on a database. AWS DynamoDB is
supported out of the box but there is no reason why the database cannot be relational (SQL). All that is required to
support this is a wrapper around the database connection that implements the internal database contract see below.

## Features

 - Provided routes:
   * `GET /`
   * `GET /:id`
   * `GET /healthz`
   * `GET /schema`
   * `POST /`
   * `PUT /:id`
   * `DELETE /:id`
 - Performs database transactions with given database wrapper (`create`, `read`, `readById`, `update`, `delete`) at
 the correct routes
 - Supports caching with `eTag`
 - Validates content type to be `application/json`
 - Validates JSON against the resource JSON Schema
 - Validates the API with Swagger
 - Mounts Swagger docs at `/docs`
 - Secures unsafe methods (`PUT`, `POST`, `DELETE`) with basic auth
 - Logging

## Installation

```sh
yarn add @photobox/cruddy-simple
```

## Available APIs

```js
import { dynamoDb, server, Either, NotFoundError } from 'cruddy-simple';
```

### DynamoDb

A function that takes a database client

`dynamoDb(client, params, createId)`

 - **client**: `Object`. The configured AWS Dynamo Client
 - **params**: `Object`. An object that contains any values needed by the AWS SDK
 - **createId**: `Function`. A function that is used to generate unique IDs for new resources

### Server

`server(schema, config, swaggerDoc, credentials, logger)(db)`

 - **schema**: `Object`. JSON Schema object representation of the resource being exposed
 - **config**: `Object`.
   * host: `String`. The hostname of the server
   * port: `Number`. The port the server is to be ran on
   * resource: `String`. The name of the resource endpoint i.e. `users`
 - **swaggerDoc**: `Object`. An object containing the swagger document to be exposed at `/docs`
 - **credentials**: `Object`.
   * name: `String`. The basic auth name
   * pass: `String`. The basic auth password
 - **logger**: `Object`.
   * info: `Function`. Logging function for information
   * error: `Function`. Logging function of errors i.e. `Internal Server Error`
   * fatal: `Function`. Logging of fatal errors that cause the application to crash
 - **db**: `Object`.
   * create: `Function`: A function to create a resource in the table, used by `POST /` requests
   * read: `Function`: A function to read all resources in the table, used by `GET /` requests
   * readById: `Function`: A function to read a resource by an ID from the table, used by `GET /:id` requests
   * update: `Function`: A function to update a resource at an ID in the table, used by `PUT /:id` requests
   * delete: `Function`: A function to delete a resource in the table, used by `DELETE /:id` requests

### Either

[Data.Either](http://docs.folktalejs.org/en/latest/api/data/either/Either.html) is used for the internal Either data
structure.

### NotFoundError

`NotFoundError(message)`

 - **message**: `String`. An optional message to attach to the error. Default: `Not Found`

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

const serverConfig = {
  host: 'localhost',
  port: 4000,
  resource: 'users',
};

AWS.config.update({
  region: 'aws-region'
  endpoint: 'aws-endpoint',
});

const client = new AWS.DynamoDB.DocumentClient();
const params = { TableName: 'users' };

const db = dynamoDb(client, params, uniqueId);

server(schema, serverConfig, doc, credentials, logger)(db);
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

The Either monad is used to represent the outcome of operations on the database.

Encapsulating the success in:
 - `Either.Right`

 and the error in:
 - `Either.Left`

This encapsulates server errors or not found errors in a consistent manner resulting in the ability to `fold` over the
data structure with an error function (left) and a success function (right).

#### Error

The routes of the application understands two types of errors:
 - `Error` a native JavaScript error
 - `NotFoundError` an extension of a JavaScript Error with the added context of representing not found when a resource
 is not available in the database

#### Example of an In-Memory Database

``` js
import { Either, NotFoundError } from 'cruddy-simple';

let uid;
let db;

const create = resource => {
  uid++;
  const newResource = { ...resource, id: uid };
  db = {
    ...db,
    [uid]: newResource,
  };
  return Either.Right(newResource);
};

const read = () => {
  const resources = Object.keys(db).map(key => db[key]);
  return Either.Right(resources);
};

const readById = id => {
  const resource = db[id];
  if (!resource) {
    return Either.Left(new NotFoundError());
  }
  return Either.Right(resource);
};

const update = (id, resource) => {
  const existing = readById(id);

  if (existing.isLeft) { // is read by id an error
    return existing;
  }

  const updatedResource = { id, ...resource };

  db = {
    ...db,
    [id]: updatedResource,
  };

  return Either.Right(updatedResource);
};

const destroy = id => {
  const resource = db[id];

  if (!resource) {
    return Either.Left(new NotFoundError());
  }

  delete db[id];
  return Either.Right();
};

export const database = () => {
  db = {};
  uid = 0;
  return {
    create,
    read,
    readById,
    update,
    delete: destroy,
  };
};
```

## License

MIT
