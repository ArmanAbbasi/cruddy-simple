import Either from 'data.either';
import { isEmpty } from 'ramda';

import { NotFoundError } from '../../utils';

const read = (client, params) => async () => {
  try {
    const data = await client.scan(params).promise();
    return Either.Right(data);
  } catch (e) {
    return Either.Left(e);
  }
};

const readById = (client, params) => async id => {
  try {
    const data = await client.get({ Key: { id }, ...params }).promise();

    if (isEmpty(data)) return Either.Left(new NotFoundError());

    return Either.Right(data);
  } catch (e) {
    return Either.Left(e);
  }
};

const upsert = async (client, params, item) => {
  try {
    await client.put({ ...params, Item: item }).promise();
    return Either.Right(item);
  } catch (e) {
    return Either.Left(e);
  }
};

const create = (client, params, createId) => async item => upsert(client, params, { ...item, id: createId() });

const update = (client, params) => async (id, item) => upsert(client, params, { ...item, id });

export default (client, params, createId) => ({
  create: create(client, params, createId),
  read: read(client, params),
  readById: readById(client, params),
  update: update(client, params),
});
