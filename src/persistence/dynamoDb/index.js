import Either from 'data.either';

const executePromise = async promise => {
  try {
    const data = await promise();
    return Either.Right(data);
  } catch (e) {
    return Either.Left(e);
  }
};

const read = (client, params) => () => executePromise(client.scan(params).promise);

const readById = (client, params) => id => executePromise(client.get({ Key: { id }, ...params }).promise);

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
