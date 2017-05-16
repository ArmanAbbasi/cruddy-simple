import Either from 'data.either';
import DynamoDb from './';

describe('Dynamo DB', () => {
  const noop = () => {};

  describe('.read', () => {
    const params = { table: 'whatever' };

    it('calls client scan', () => {
      const scanSpy = jest.fn(() => ({ promise: noop }));
      const client = { scan: scanSpy };
      DynamoDb(client).read();
      expect(scanSpy).toHaveBeenCalled();
    });

    it('calls client scan with params', () => {
      const scanSpy = jest.fn(() => ({ promise: noop }));
      const client = { scan: scanSpy };

      DynamoDb(client, params).read();
      expect(scanSpy).toHaveBeenCalledWith(params);
    });

    it('calls promise on scan', () => {
      const promiseSpy = jest.fn();
      const client = { scan: () => ({ promise: promiseSpy }) };

      DynamoDb(client, params).read();
      expect(promiseSpy).toHaveBeenCalled();
    });

    it('returns success with data when promise resolves', async () => {
      const promiseSpy = () => Promise.resolve([1, 2, 3]);
      const client = { scan: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).read();
      expect(actual).toEqual(Either.Right([1, 2, 3]));
    });

    it('returns error with message when promise rejects', async () => {
      const promiseSpy = () => Promise.reject('Error something went wrong');
      const client = { scan: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).read();
      expect(actual).toEqual(Either.Left('Error something went wrong'));
    });
  });

  describe('.readById', () => {
    const noop = () => {};
    const params = { table: 'whatever' };

    it('calls client get', () => {
      const getSpy = jest.fn(() => ({ promise: noop }));
      const client = { get: getSpy };
      DynamoDb(client).readById(1001);
      expect(getSpy).toHaveBeenCalled();
    });

    it('calls client get with params and id', () => {
      const getSpy = jest.fn(() => ({ promise: noop }));
      const client = { get: getSpy };

      DynamoDb(client, params).readById(1001);
      expect(getSpy).toHaveBeenCalledWith({ table: 'whatever', Key: { id: 1001 } });
    });

    it('calls promise on get', () => {
      const promiseSpy = jest.fn();
      const client = { get: () => ({ promise: promiseSpy }) };

      DynamoDb(client, params).readById();
      expect(promiseSpy).toHaveBeenCalled();
    });

    it('returns success with data when promise resolves', async () => {
      const promiseSpy = () => Promise.resolve([1, 2, 3]);
      const client = { get: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).readById();
      expect(actual).toEqual(Either.Right([1, 2, 3]));
    });

    it('returns error with message when promise rejects', async () => {
      const promiseSpy = () => Promise.reject('Error something went wrong');
      const client = { get: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).readById();
      expect(actual).toEqual(Either.Left('Error something went wrong'));
    });
  });

  describe('.create', () => {
    it('calls client put with given Item and db params', async () => {
      const item = { id: 100, name: 'Shape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy };

      await DynamoDb(client, { table: 'hello' }).create(item);

      expect(putSpy).toHaveBeenCalledWith({ table: 'hello', Item: item });
    });
  });

  it('calls put promise', async () => {
    const item = { id: 100, name: 'Shape' };
    const promiseSpy = jest.fn();
    const client = { put: () => ({ promise: promiseSpy }) };

    await DynamoDb(client, { table: 'hello' }).create(item);

    expect(promiseSpy).toHaveBeenCalled();
  });

  it('returns item when client put is successful', async () => {
    const item = { id: 100, name: 'Shape' };
    const promiseSpy = () => Promise.resolve(item);
    const client = { put: () => ({ promise: promiseSpy }) };

    const actual = await DynamoDb(client, { table: 'hello' }).create(item);

    expect(actual).toEqual(Either.Right(item));
  });

  it('returns error when put fails', async () => {
    const item = { id: 100, name: 'Shape' };
    const promiseSpy = () => Promise.reject('Error unable to connect to DynamoDB');
    const client = { put: () => ({ promise: promiseSpy }) };

    const actual = await DynamoDb(client, { table: 'hello' }).create(item);

    expect(actual).toEqual(Either.Left('Error unable to connect to DynamoDB'));
  });
});
