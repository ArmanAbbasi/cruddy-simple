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

const create = (client, params, createId) => async item => {
  const Item = { ...item, id: createId() };
  try {
    await client.put({ ...params, Item }).promise();
    return Either.Right(Item);
  } catch (e) {
    return Either.Left(e);
  }
};

export default (client, params, createId) => ({
  read: read(client, params),
  readById: readById(client, params),
  create: create(client, params, createId),
});
