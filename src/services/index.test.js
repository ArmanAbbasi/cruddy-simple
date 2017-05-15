import Either from 'data.either';

import { getAll } from './';

describe('Services', () => {
  describe('.getAll', () => {
    it('returns given context', async () => {
      const ctx = {};
      const db = { read: () => Promise.resolve(Either.Right([])) };
      const actual = await getAll(db)(ctx);
      expect(actual).toBe(ctx);
    });

    it('returns context body as empty array when no options exist', async () => {
      const ctx = {};
      const db = { read: () => Promise.resolve(Either.Right([])) };
      const { body } = await getAll(db)(ctx);
      expect(body).toEqual([]);
    });

    it('returns context body as all option groups available in database', async () => {
      const ctx = {};
      const db = {
        read: () => Promise.resolve(Either.Right([{ id: 1 }, { id: 2 }, { id: 3 }])),
      };
      const { body } = await getAll(db)(ctx);
      expect(body).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('calls context throw with status and message when database returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { throw: throwSpy };
      const db = {
        read: () => Promise.resolve(Either.Left('Error not connected to Database')),
      };
      await getAll(db)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error not connected to Database');
    });
  });
});
