import Either from 'data.either';

import { get, getAll, post } from './';

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

  describe('.post', () => {
    it('calls db create with context request body', () => {
      const createSpy = jest.fn(() => Either.Right({ id: 100, whatever: 'trevor' }));
      const db = { create: createSpy };
      const ctx = { request: { body: { whatever: 'trevor' } } };
      post(db)(ctx);
      expect(createSpy).toHaveBeenCalledWith({ whatever: 'trevor' });
    });

    it('calls ctx throw with 500 and error message when create returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const createSpy = () => Either.Left('Error could not connect to database');
      const db = { create: createSpy };

      await post(db)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error could not connect to database');
    });

    it('returns ctx with body set to result of create when create is successful', async () => {
      const ctx = { request: { body: { whatever: 'trevor' } } };
      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      const actual = await post(db)(ctx);
      expect(actual.body).toEqual({
        id: 100,
        whatever: 'trevor',
      });
    });

    it('returns ctx with status set to 201 when create is successful', async () => {
      const ctx = { request: { body: { whatever: 'trevor' } } };
      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      const actual = await post(db)(ctx);
      expect(actual.status).toBe(201);
    });

    it('calls throw when id is present in request body', async () => {
      const throwSpy = jest.fn();
      const ctx = { request: { body: { id: 100, whatever: 'trevor' } }, throw: throwSpy };

      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      await post(db)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(400, 'Cannot include id in request body');
    });
  });
});
