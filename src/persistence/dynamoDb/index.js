import Either from 'data.either';
import { isEmpty } from 'ramda';

import { NotFoundError } from '../../utils';

const read = (client, params) => async () => {
  try {
    const data = await client.scan(params).promise();
    return Either.Right(data.Items);
  } catch (e) {
    return Either.Left(e);
  }
};

const readById = (client, params) => async id => {
  try {
    const data = await client.get({ Key: { id }, ...params }).promise();

    if (isEmpty(data)) return Either.Left(new NotFoundError());

    return Either.Right(data.Item);
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

const create = (client, params, createId, selfLink) => async item => {
  const id = createId();

  if (selfLink) {
    return upsert(client, params, selfLink(id, { ...item, id }));
  }

  return upsert(client, params, { ...item, id });
};

const update = (client, params) => async (id, item) => {
  const result = await readById(client, params)(id);

  if (result.isLeft) return result;

  return upsert(client, params, { ...item, id });
};

const destroy = (client, params) => async id => {
  const result = await readById(client, params)(id);

  if (result.isLeft) return result;

  try {
    const deletedItem = await client.delete({ ...params, Key: { id } }).promise();
    return Either.Right(deletedItem);
  } catch (e) {
    return Either.Left(e);
  }
};

export default (client, params, createId, selfLink) => ({
  create: create(client, params, createId, selfLink),
  read: read(client, params),
  readById: readById(client, params),
  update: update(client, params),
  delete: destroy(client, params),
});
