import Either from 'data.either';
import each from 'jest-each';

import { NotFoundError } from '../utils';

import {
  authUnsafeMethods,
  destroy,
  get,
  getAll,
  health,
  post,
  put,
  schemaMiddleware,
  validateBodyWithSchema,
  validateContentType,
} from './';

describe('Services', () => {
  const noop = () => {};

  describe('.authUnsafeMethods', () => {
    each([
      ['POST'],
      ['PUT'],
      ['DELETE'],
    ]).it('calls authMiddlware with context and next with request method: %s', method => {
      const ctx = { request: { method } };
      const authMiddlwareSpy = jest.fn();
      const next = noop;
      authUnsafeMethods(authMiddlwareSpy)(ctx, next);
      expect(authMiddlwareSpy).toHaveBeenCalledWith(ctx, next);
    });

    it('calls next when request method is GET', () => {
      const ctx = { request: { method: 'GET' } };
      const next = jest.fn();
      const authMiddlwareSpy = noop;
      authUnsafeMethods(authMiddlwareSpy)(ctx, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('.getAll', () => {
    it('returns given context', async () => {
      const ctx = {};
      const db = { read: () => Promise.resolve(Either.Right([])) };
      const actual = await getAll(db, noop)(ctx);
      expect(actual).toBe(ctx);
    });

    it('returns context body as empty array when no options exist', async () => {
      const ctx = {};
      const db = { read: () => Promise.resolve(Either.Right([])) };
      const { body } = await getAll(db, noop)(ctx);
      expect(body).toEqual([]);
    });

    it('returns context body as all option groups available in database', async () => {
      const ctx = {};
      const db = {
        read: () => Promise.resolve(Either.Right([{ id: 1 }, { id: 2 }, { id: 3 }])),
      };
      const { body } = await getAll(db, noop)(ctx);
      expect(body).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('calls context throw with status and message when database returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { throw: throwSpy };
      const db = {
        read: () => Promise.resolve(Either.Left(new Error('Error not connected to Database'))),
      };
      await getAll(db, { error: noop })(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error not connected to Database');
    });

    it('calls logger error with error message when database returns an error', async () => {
      const ctx = { throw: noop };
      const errorSpy = jest.fn();
      const db = {
        read: () => Promise.resolve(Either.Left(new Error('Error not connected to Database'))),
      };
      await getAll(db, { error: errorSpy })(ctx);
      expect(errorSpy).toHaveBeenCalledWith('ERROR: Error not connected to Database');
    });
  });

  describe('.get', () => {
    it('calls db readById with id in context params', async () => {
      const ctx = { params: { id: 100 } };
      const readByIdSpy = jest.fn(() => Either.Right({ Item: { id: 100, name: 'Shape' } }));
      const db = { readById: readByIdSpy };

      await get(db, noop)(ctx);

      expect(readByIdSpy).toHaveBeenCalledWith(100);
    });

    it('returns context with body as found option group', async () => {
      const ctx = { params: { id: 100 } };
      const readByIdSpy = jest.fn(() => Either.Right({ Item: { id: 100, name: 'Shape' } }));
      const db = { readById: readByIdSpy };

      const actual = await get(db, noop)(ctx);

      expect(actual).toEqual({
        params: { id: 100 },
        body: { Item: { id: 100, name: 'Shape' } },
      });
    });

    it('calls ctx throw with 500 and error message when readById returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, throw: throwSpy };
      const readByIdSpy = jest.fn(() => Either.Left(new Error('Error no group found')));
      const db = { readById: readByIdSpy };

      await get(db, { error: noop })(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error no group found');
    });

    it('calls ctx throw with 404 when readById returns a NotFoundError', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, throw: throwSpy };
      const readByIdSpy = jest.fn(() => Either.Left(new NotFoundError()));
      const db = { readById: readByIdSpy };

      await get(db, noop)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(404);
    });

    it('calls logger error with error message when database returns an error', async () => {
      const ctx = { params: { id: 100 }, throw: noop };
      const errorSpy = jest.fn();
      const readByIdSpy = jest.fn(() => Either.Left(new Error('Error no data found')));
      const db = { readById: readByIdSpy };

      await get(db, { error: errorSpy })(ctx);
      expect(errorSpy).toHaveBeenCalledWith('ERROR: Error no data found');
    });
  });

  describe('.health', () => {
    it('sets context body to stringified OK', async () => {
      const ctx = {};
      await health(ctx);
      expect(ctx.body).toBe('"OK"');
    });
  });

  describe('.post', () => {
    it('calls db create with context request body', () => {
      const createSpy = jest.fn(() => Either.Right({ id: 100, whatever: 'trevor' }));
      const db = { create: createSpy };
      const ctx = { set: noop, request: { body: { whatever: 'trevor' } } };
      post(db, noop)(ctx);
      expect(createSpy).toHaveBeenCalledWith({ whatever: 'trevor' });
    });

    it('calls logger error with error message when database returns an error', async () => {
      const errorSpy = jest.fn();

      const ctx = { set: noop, request: { body: { whatever: 'trevor' } }, throw: noop };
      const createSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { create: createSpy };

      await post(db, { error: errorSpy })(ctx);
      expect(errorSpy).toHaveBeenCalledWith('ERROR: Error could not connect to database');
    });

    it('calls ctx throw with 500 and error message when create returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { set: noop, request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const createSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { create: createSpy };

      await post(db, { error: noop })(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error could not connect to database');
    });

    it('returns ctx with body set to result of create when create is successful', async () => {
      const ctx = { set: noop, request: { body: { whatever: 'trevor' } } };
      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      const actual = await post(db, noop)(ctx);
      expect(actual.body).toEqual({
        id: 100,
        whatever: 'trevor',
      });
    });

    it('returns ctx with status set to 201 when create is successful', async () => {
      const ctx = { set: noop, request: { body: { whatever: 'trevor' } } };
      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      const actual = await post(db, noop)(ctx);
      expect(actual.status).toBe(201);
    });

    it('calls ctx set with Location and to ctx.origin/ctx.path/id', async () => {
      const setSpy = jest.fn();
      const ctx = { path: 'hello', set: setSpy, request: { body: { whatever: 'trevor' } }, origin: 'www.example.com' };
      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      await post(db, noop)(ctx);
      expect(setSpy).toHaveBeenCalledWith('Location', 'www.example.com/hello/100');
    });

    it('calls throw when id is present in request body', async () => {
      const throwSpy = jest.fn();
      const ctx = { set: noop, request: { body: { id: 100, whatever: 'trevor' } }, throw: throwSpy };

      const createSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { create: createSpy };

      await post(db, noop)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(400, 'Cannot include id in request body');
    });
  });

  describe('.put', () => {
    it('calls throw with 400 when id is present in request body', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: {}, request: { body: { id: 100, whatever: 'trevor' } }, throw: throwSpy };

      const updateSpy = () => Either.Right({ id: 100, whatever: 'trevor' });
      const db = { update: updateSpy };

      await put(db, noop)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(400, 'Cannot include id in request body');
    });

    it('calls db update with context params id and request body when group exists', () => {
      const updateSpy = jest.fn(() => Either.Right({ id: 100, whatever: 'trevor' }));
      const db = { update: updateSpy };
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } } };
      put(db, noop)(ctx);
      expect(updateSpy).toHaveBeenCalledWith(100, { whatever: 'trevor' });
    });

    it('calls ctx throw with 500 and error message when update returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const updateSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { update: updateSpy };

      await put(db, { error: noop })(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error could not connect to database');
    });

    it('calls logger error with error message when database returns an error', async () => {
      const errorSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: noop };
      const updateSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { update: updateSpy };

      await put(db, { error: errorSpy })(ctx);
      expect(errorSpy).toHaveBeenCalledWith('ERROR: Error could not connect to database');
    });

    it('calls ctx throw with 404 when update returns an not found error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const updateSpy = () => Either.Left(new NotFoundError());
      const db = { update: updateSpy };

      await put(db, noop)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(404);
    });

    it('returns ctx with body set to result of update when successful', async () => {
      const updateSpy = jest.fn(() => Either.Right({ id: 100, whatever: 'trevor' }));
      const db = { update: updateSpy };
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } } };

      const actual = await put(db, noop)(ctx);
      expect(actual.body).toEqual({
        id: 100,
        whatever: 'trevor',
      });
    });
  });

  describe('.destroy', () => {
    it('calls db delete with given id', () => {
      const ctx = { params: { id: 100 } };
      const deleteSpy = jest.fn(() => Either.Right());
      const db = { delete: deleteSpy };

      destroy(db, noop)(ctx);
      expect(deleteSpy).toHaveBeenCalledWith(100);
    });

    it('calls ctx throw with 500 and error message when delete returns an error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const deleteSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { delete: deleteSpy };

      await destroy(db, { error: noop })(ctx);
      expect(throwSpy).toHaveBeenCalledWith(500, 'Error could not connect to database');
    });

    it('calls logger error with error message when database returns an error', async () => {
      const errorSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: noop };
      const deleteSpy = () => Either.Left(new Error('Error could not connect to database'));
      const db = { delete: deleteSpy };

      await destroy(db, { error: errorSpy })(ctx);
      expect(errorSpy).toHaveBeenCalledWith('ERROR: Error could not connect to database');
    });

    it('calls ctx throw with 404 when delete returns an not found error', async () => {
      const throwSpy = jest.fn();
      const ctx = { params: { id: 100 }, request: { body: { whatever: 'trevor' } }, throw: throwSpy };
      const deleteSpy = () => Either.Left(new NotFoundError());
      const db = { delete: deleteSpy };

      await destroy(db, noop)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(404);
    });

    it('returns ctx status code 204 and body as null when successful', async () => {
      const deleteSpy = jest.fn(() => Either.Right({}));
      const db = { delete: deleteSpy };
      const ctx = { body: null, params: { id: 100 }, request: { body: { whatever: 'trevor' } } };

      const actual = await destroy(db, noop)(ctx);
      expect(actual.status).toBe(204);
      expect(actual.body).toEqual(null);
    });
  });

  describe('.schemaMiddleware', () => {
    it('sets ctx body with given schema', () => {
      const ctx = {};
      const schema = { hello: 'world' };
      schemaMiddleware(schema)(ctx);
      expect(ctx.body).toEqual(schema);
    });
  });

  describe('.validateContentType', () => {
    const type = 'application/json';
    it('calls ctx.is with given type', () => {
      const isSpy = jest.fn();
      const ctx = { is: isSpy };
      validateContentType(type)(ctx, () => {});
      expect(isSpy).toHaveBeenCalledWith(type);
    });

    it('calls ctx throw with 400 and message when ctx is returns false', () => {
      const throwSpy = jest.fn();
      const ctx = {
        is: () => false,
        throw: throwSpy,
      };
      validateContentType(type)(ctx);
      expect(throwSpy).toHaveBeenCalledWith(400, 'Error content type must be application/json');
    });

    it('calls next when ctx is returns null', () => {
      const ctx = { is: () => null };
      const nextSpy = jest.fn();
      validateContentType(type)(ctx, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('calls next when ctx is returns true', () => {
      const ctx = { is: () => true };
      const nextSpy = jest.fn();
      validateContentType(type)(ctx, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('.validateBodyWithSchema', () => {
    const noop = () => {};

    ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'random'].forEach(method => {
      describe(`when the request method is: ${method}`, () => {
        it('calls next', () => {
          const next = jest.fn();
          const ctx = { request: { body: {}, method } };
          validateBodyWithSchema(noop)(ctx, next);
          expect(next).toHaveBeenCalled();
        });

        it('does not call validator', () => {
          const validator = jest.fn();
          const ctx = { request: { body: {}, method } };
          validateBodyWithSchema(validator)(ctx, noop);
          expect(validator).not.toHaveBeenCalled();
        });
      });
    });

    ['post', 'put', 'patch', 'POST', 'PUT', 'PATCH'].forEach(method => {
      describe(`when the request method is: ${method}`, () => {
        it('calls validator with request body when body is empty', () => {
          const validator = jest.fn();
          const ctx = { request: { body: {}, method }, throw: noop };
          validateBodyWithSchema(validator)(ctx, noop);
          expect(validator).toHaveBeenCalledWith({});
        });

        it('calls validator with request body when body is present', () => {
          const validator = jest.fn();
          const ctx = { request: { body: { whatever: 'trevor' }, method }, throw: noop };
          validateBodyWithSchema(validator)(ctx, noop);
          expect(validator).toHaveBeenCalledWith({ whatever: 'trevor' });
        });

        it('calls ctx throw with 400 and validator errors when validator returns false', () => {
          const validator = () => false;
          validator.errors = [1, 2, 3];
          const throwSpy = jest.fn();
          const ctx = { request: { body: { whatever: 'trevor' }, method }, throw: throwSpy };
          validateBodyWithSchema(validator)(ctx, noop);
          expect(throwSpy).toHaveBeenCalledWith(400, JSON.stringify([1, 2, 3], null, 2));
        });

        it('does not call ctx throw when validator returns true', () => {
          const validator = () => true;
          const throwSpy = jest.fn();
          const ctx = { request: { body: { whatever: 'trevor' }, method }, throw: throwSpy };
          validateBodyWithSchema(validator)(ctx, noop);
          expect(throwSpy).not.toHaveBeenCalled();
        });

        it('calls next request has a body and when validator returns true', () => {
          const validator = () => true;
          const nextSpy = jest.fn();
          const ctx = { request: { body: { whatever: 'trevor' }, method }, throw: noop };
          validateBodyWithSchema(validator)(ctx, nextSpy);
          expect(nextSpy).toHaveBeenCalled();
        });
      });
    });
  });
});
