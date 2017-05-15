import Either from 'data.either';
import DynamoDb from './';

describe('Dynamo DB', () => {
  describe('.read', () => {
    const noop = () => {};
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
});
