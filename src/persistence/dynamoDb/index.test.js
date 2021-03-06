import Either from 'data.either';
import { NotFoundError } from '../../utils';

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

    it('returns success with Items from data when promise resolves', async () => {
      const promiseSpy = () => Promise.resolve({ Items: [1, 2, 3] });
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

    it('returns success with Item from data when promise resolves', async () => {
      const promiseSpy = () => Promise.resolve({ Item: [1] });
      const client = { get: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).readById();
      expect(actual).toEqual(Either.Right([1]));
    });

    it('returns not found error when promise resolves to no data', async () => {
      const promiseSpy = () => Promise.resolve([]);
      const client = { get: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).readById();
      expect(actual).toEqual(Either.Left(new NotFoundError()));
    });

    it('returns error with message when promise rejects', async () => {
      const promiseSpy = () => Promise.reject('Error something went wrong');
      const client = { get: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).readById();
      expect(actual).toEqual(Either.Left('Error something went wrong'));
    });
  });

  describe('.create', () => {
    const params = { table: 'hello' };

    it('calls createId function to generate a unique id', async () => {
      const item = { name: 'Shape' };
      const client = { put: noop };
      const createIdSpy = jest.fn();

      await DynamoDb(client, params, createIdSpy).create(item);

      expect(createIdSpy).toHaveBeenCalled();
    });

    it('calls client put with an object containing given item, db params and a unique id', async () => {
      const item = { name: 'Shape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy };
      const createId = () => 100;
      await DynamoDb(client, params, createId).create(item);

      expect(putSpy).toHaveBeenCalledWith({ table: 'hello', Item: { id: 100, name: 'Shape' } });
    });

    it('returns item with generated id when client put is successful', async () => {
      const item = { name: 'Shape' };
      const promiseSpy = () => Promise.resolve(item);
      const client = { put: () => ({ promise: promiseSpy }) };

      const createId = () => 911;
      const actual = await DynamoDb(client, params, createId).create(item);

      expect(actual).toEqual(Either.Right({ id: 911, name: 'Shape' }));
    });

    it('returns error when put fails', async () => {
      const item = { name: 'Shape' };
      const promiseSpy = () => Promise.reject('Error unable to connect to DynamoDB');
      const client = { put: () => ({ promise: promiseSpy }) };
      const actual = await DynamoDb(client, params, noop).create(item);

      expect(actual).toEqual(Either.Left('Error unable to connect to DynamoDB'));
    });
  });

  describe('.update', () => {
    const params = { table: 'hello' };

    it('calls client get with an id', async () => {
      const getSpy = jest.fn(() => ({ promise: () => Promise.reject('') }));
      const client = { get: getSpy };
      const item = { name: 'Shape' };

      await DynamoDb(client, params).update(100, item);

      expect(getSpy).toHaveBeenCalledWith({ table: 'hello', Key: { id: 100 } });
    });

    it('returns not found error when client get returns an empty object', async () => {
      const item = { name: 'Shape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy, get: () => ({ promise: () => Promise.resolve({}) }) };

      const actual = await DynamoDb(client, params).update(100, item);

      expect(actual).toEqual(Either.Left(new NotFoundError()));
    });

    it('returns error when client get fails', async () => {
      const item = { name: 'Shape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy, get: () => ({ promise: () => Promise.reject('Some error') }) };

      const actual = await DynamoDb(client, params).update(100, item);

      expect(actual).toEqual(Either.Left('Some error'));
    });

    it('calls client put with an object containing given item, db params and id when get is successful', async () => {
      const item = { name: 'Shape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy, get: () => ({ promise: () => Promise.resolve({ id: 100 }) }) };

      await DynamoDb(client, params).update(100, item);

      expect(putSpy).toHaveBeenCalledWith({ table: 'hello', Item: { id: 100, name: 'Shape' } });
    });

    it('returns item with id when client put is successful', async () => {
      const item = { name: 'Shape' };
      const promiseSpy = () => Promise.resolve(item);
      const client = {
        put: () => ({ promise: promiseSpy }),
        get: () => ({ promise: () => Promise.resolve({ id: 911 }) }),
      };

      const actual = await DynamoDb(client, params).update(911, item);

      expect(actual).toEqual(Either.Right({ id: 911, name: 'Shape' }));
    });

    it('returns error when put fails', async () => {
      const item = { name: 'Shape' };
      const promiseSpy = () => Promise.reject('Error unable to connect to DynamoDB');
      const client = {
        put: () => ({ promise: promiseSpy }),
        get: () => ({ promise: () => Promise.resolve({ id: 911 }) }),
      };

      const actual = await DynamoDb(client, params).update(100, item);

      expect(actual).toEqual(Either.Left('Error unable to connect to DynamoDB'));
    });
  });

  describe('.upsert', () => {
    const params = { table: 'hello' };

    it('calls client upsert with the specified item', async () => {
      const item = { id: 111, name: 'Snape' };
      const putSpy = jest.fn(() => ({ promise: noop }));
      const client = { put: putSpy, get: () => ({ promise: () => Promise.resolve({}) }) };

      await DynamoDb(client, params).upsert(item);

      expect(putSpy).toHaveBeenCalledWith({ table: 'hello', Item: { id: 111, name: 'Snape' } });
    });

    it('returns item client upsert is successful', async () => {
      const item = { name: 'Snape' };
      const promiseSpy = () => Promise.resolve(item);
      const client = { put: () => ({ promise: promiseSpy }) };

      const actual = await DynamoDb(client, params).upsert(item);

      expect(actual).toEqual(Either.Right({ name: 'Snape' }));
    });

    it('returns error when upsert fails', async () => {
      const item = { name: 'Snape' };
      const promiseSpy = () => Promise.reject('Professor Snape is displeased');
      const client = { put: () => ({ promise: promiseSpy }) };
      const actual = await DynamoDb(client, params).upsert(item);

      expect(actual).toEqual(Either.Left('Professor Snape is displeased'));
    });
  });

  describe('.delete', () => {
    const params = { table: 'hello' };

    it('calls client get with an id', async () => {
      const getSpy = jest.fn(() => ({ promise: () => Promise.reject('') }));
      const client = { get: getSpy };

      await DynamoDb(client, params).delete(100);

      expect(getSpy).toHaveBeenCalledWith({ table: 'hello', Key: { id: 100 } });
    });

    it('returns not found error when client get returns an empty object', async () => {
      const deleteSpy = jest.fn(() => ({ promise: noop }));
      const client = { delete: deleteSpy, get: () => ({ promise: () => Promise.resolve({}) }) };

      const actual = await DynamoDb(client, params).delete(100);

      expect(actual).toEqual(Either.Left(new NotFoundError()));
    });

    it('returns error when client get fails', async () => {
      const deleteSpy = jest.fn(() => ({ promise: noop }));
      const client = { delete: deleteSpy, get: () => ({ promise: () => Promise.reject('Some error') }) };

      const actual = await DynamoDb(client, params).delete(100);

      expect(actual).toEqual(Either.Left('Some error'));
    });

    it('calls client delete with an object containing given id and db params when get is successful', async () => {
      const deleteSpy = jest.fn(() => ({ promise: noop }));
      const client = { delete: deleteSpy, get: () => ({ promise: () => Promise.resolve({ id: 100 }) }) };

      await DynamoDb(client, params).delete(100);

      expect(deleteSpy).toHaveBeenCalledWith({ table: 'hello', Key: { id: 100 } });
    });

    it('returns item that has been deleted when successful', async () => {
      const promiseSpy = () => Promise.resolve({ id: 911 });
      const client = {
        delete: () => ({ promise: promiseSpy }),
        get: () => ({ promise: () => Promise.resolve({ id: 911 }) }),
      };

      const actual = await DynamoDb(client, params).delete(911);

      expect(actual).toEqual(Either.Right({ id: 911 }));
    });

    it('returns error when delete fails', async () => {
      const promiseSpy = () => Promise.reject('Error unable to connect to DynamoDB');
      const client = {
        delete: () => ({ promise: promiseSpy }),
        get: () => ({ promise: () => Promise.resolve({ id: 911 }) }),
      };

      const actual = await DynamoDb(client, params).delete(100);

      expect(actual).toEqual(Either.Left('Error unable to connect to DynamoDB'));
    });
  });
});
