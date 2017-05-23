# cruddy-simple

Generic CRUD Node application. Which takes configuration and provides CRUD on a database. AWS DynamoDB is supported out of the box but there is no reason why the database couldn't be relational (SQL), all that is required to support this is a wrapper around the database connection that implements the internal database interface [example](https://github.com/photobox/cruddy-simple/blob/master/src/persistence/inMemoryDb/index.js)

## Features

 - Provided routes:
   * `GET /`
   * `GET /:id`
   * `GET /healthz`
   * `POST /`
   * `PUT /:id`
   * `DELETE /:id`
 - Performs database transactions with given database interface (`create`, `read`, `readById`, `update`, `delete`) at the correct routes
 - Supports caching with `eTag`
 - Validates content type to be `application/json`
 - Validates JSON against the resource JSON Schema
 - Validates the API with Swagger
 - Mounts Swagger docs at `/docs`
 - Secures unsafe methods (`PUT`, `POST`, `DELETE`) with basic auth
 - Logging

## Installation

```sh
# pending private npm modules
yarn add cruddy-simple
```

## API

### DynamoDb

`dynamoDb(client, params, createId)`

`dynamoDb`:
 - client: `Object`. The configured AWS Dynamo Client
 - params: `Object`. An object that contains any values needed by the AWS SDK
 - createId: `Function`. A function that is used to generate unique IDs for new resources

### Server

`server(schema, config, swaggerDoc, credentials, logger)(db)`

`server`:

 - schema: `Object`. JSON Schema object representation of the resource being exposed
 - config: `Object`.
   * host: `String`. The hostname of the server
   * port: `Number`. The port the server is to be ran on
   * resource: `String`. The name of the resource endpoint i.e. `users`
 - swaggerDoc: `Object`. An object containing the swagger document to be exposed at `/docs`
 - credentials: `Object`.
   * name: `String`. The basic auth name
   * pass: `String`. The basic auth password
 - logger: `Object`.
   * info: `Function`. Logging function for information
   * error: `Function`. Logging function of errors i.e. `Internal Server Error`
   * fatal: `Function`. Logging of fatal errors that cause the application to crash
 - db: `Object`.
   * create: `Function`: A function to create a resource in the table, used by `POST /` requests
   * read: `Function`: A function to read all resources in the table, used by `GET /` requests
   * readById: `Function`: A function to read a resource by an ID from the table, used by `GET /:id` requests
   * update: `Function`: A function to update a resource at an ID in the table, used by `PUT /:id` requests
   * delete: `Function`: A function to delete a resource in the table, used by `DELETE /:id` requests

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
  region: 'eu-west-1'
  endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
});

const client = new AWS.DynamoDB.DocumentClient();
const params = { TableName: 'users' };

const db = dynamoDb(client, params, uniqueId);

server(schema, serverConfig, doc, credentials, logger)(db);
```
