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

export default (client, params) => ({
  read: read(client, params),
  readById: readById(client, params),
});
