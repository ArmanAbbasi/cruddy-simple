import Either from 'data.either';

import { get, getAll } from './';

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

  describe('.get', () => {
    it('calls db readById with id in context params', async () => {
      const ctx = { params: { id: 100 } };
      const readByIdSpy = jest.fn(() => Either.Right({ Item: { id: 100, name: 'Shape' } }));
      const db = { readById: readByIdSpy };

      await get(db)(ctx);

      expect(readByIdSpy).toHaveBeenCalledWith(100);
    });

    it('returns context with body as found option group', async () => {
      const ctx = { params: { id: 100 } };
      const readByIdSpy = jest.fn(() => Either.Right({ Item: { id: 100, name: 'Shape' } }));
      const db = { readById: readByIdSpy };

      const actual = await get(db)(ctx);

      expect(actual).toEqual({
        params: { id: 100 },
        body: { Item: { id: 100, name: 'Shape' } },
      });
    });

    it('calls ctx throw with 500 and error message when readById returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, throw: throwSpy };
      const readByIdSpy = jest.fn(() => Either.Left('Error no group found'));
      const db = { readById: readByIdSpy };

      await get(db)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error no group found');
    });

    it('calls ctx throw with 404 when readById returns an empty item', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, throw: throwSpy };
      const readByIdSpy = jest.fn(() => Either.Right({}));
      const db = { readById: readByIdSpy };

      await get(db)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(404);
    });
  });
});
