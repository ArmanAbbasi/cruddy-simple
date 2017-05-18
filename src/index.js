import AWS from 'aws-sdk';
import uuid from 'uuid';

import server from './server';
import inMemoryDb from './persistence/inMemoryDb';
import DynamoDB from './persistence/dynamoDb';

import schema from './schema/option-group';

const url = {
  host: 'localhost',
  port: 8000,
  resource: 'group',
};

AWS.config.update({
  region: 'eu-west-1',
  endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
});

const TableName = 'ecom-option-group-service-integration';
const client = new AWS.DynamoDB.DocumentClient();

const params = { TableName };

const db = DynamoDB(client, params, uuid);

server(schema, url)(db);
