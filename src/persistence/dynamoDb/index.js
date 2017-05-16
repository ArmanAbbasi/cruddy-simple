import Either from 'data.either';

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
    return Either.Right(data);
  } catch (e) {
    return Either.Left(e);
  }
};

export default (client, params) => ({
  read: read(client, params),
  readById: readById(client, params),
});
