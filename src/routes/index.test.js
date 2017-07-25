import each from 'jest-each';

import routes from './';

describe('Routes', () => {
  const noop = () => {};

  describe('GET /', () => {
    it('calls router get with / and a function', () => {
      const getSpy = jest.fn();
      const router = {
        get: getSpy,
        post: noop,
        put: noop,
        delete: noop,
      };
      const db = { read: () => {} };
      routes(router, db, noop, {}, []);
      expect(getSpy).toHaveBeenCalledWith('/', expect.any(Function));
    });
  });

  describe('GET /:id', () => {
    it('calls router get with / and a function', () => {
      const getSpy = jest.fn();
      const router = {
        get: getSpy,
        post: noop,
        put: noop,
        delete: noop,
      };
      const db = { read: () => {} };
      routes(router, db, noop, {}, []);
      expect(getSpy).toHaveBeenCalledWith('/:id', expect.any(Function));
    });
  });

  describe('POST /', () => {
    it('calls router post with / and a function', () => {
      const postSpy = jest.fn();
      const router = {
        get: noop,
        post: postSpy,
        put: noop,
        delete: noop,
      };
      const db = { read: () => {} };
      routes(router, db, noop, {}, []);
      expect(postSpy).toHaveBeenCalledWith('/', expect.any(Function));
    });
  });

  describe('PUT /:id (normal mode)', () => {
    it('calls router put with /:id and a function', () => {
      const putSpy = jest.fn();
      const router = {
        get: noop,
        post: noop,
        put: putSpy,
        delete: noop,
      };
      const db = { read: () => {} };
      routes(router, db, noop, {}, []);
      expect(putSpy).toHaveBeenCalledWith('/:id', expect.any(Function));
    });
  });

  describe('PUT /:id (Upsert mode)', () => {
    it('calls router upsert with /:id and a function', () => {
      const putSpy = jest.fn();
      const router = {
        get: noop,
        post: noop,
        put: putSpy,
        delete: noop,
      };
      const db = {};

      routes(router, db, noop, {}, [], true);
      expect(putSpy).toHaveBeenCalledWith('/:id', expect.any(Function));
    });
  });

  describe('DELETE /:id', () => {
    it('calls router delete with /:id and a function', () => {
      const deleteSpy = jest.fn();
      const router = {
        get: noop,
        post: noop,
        put: noop,
        delete: deleteSpy,
      };
      const db = { read: () => {} };
      routes(router, db, noop, {}, []);
      expect(deleteSpy).toHaveBeenCalledWith('/:id', expect.any(Function));
    });
  });

  describe('GET /healthz', () => {
    it('calls router get with /healthz and a function', () => {
      const getSpy = jest.fn();
      const router = {
        get: getSpy,
        post: noop,
        put: noop,
        delete: noop,
      };
      const db = {};
      routes(router, db, noop, {}, []);
      expect(getSpy).toHaveBeenCalledWith('/healthz', expect.any(Function));
    });
  });

  describe('GET /schema', () => {
    it('calls router get with /schema and a function', () => {
      const getSpy = jest.fn();
      const router = {
        get: getSpy,
        post: noop,
        put: noop,
        delete: noop,
      };
      const db = {};
      routes(router, db, noop, {}, []);
      expect(getSpy).toHaveBeenCalledWith('/schema', expect.any(Function));
    });
  });

  describe('Custom routes', () => {
    each([
      ['method', { path: '/:name', middleware: [noop] }],
      ['path', { method: 'get', middleware: [noop] }],
      ['middleware', { path: '/:name', method: 'get' }],
    ]).it('calls logger error with missing property message when route does not have %s key', (prop, route) => {
      const router = {
        get: noop,
        post: noop,
        put: noop,
        delete: noop,
      };
      const customRoutes = [route];
      const logger = { error: jest.fn() };
      routes(router, noop, logger, {}, customRoutes);

      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.error.mock.calls[0][0]).toBe(`Route missing ${prop} property`);
      expect(logger.error.mock.calls[0][1]).toBe(route);
      expect(logger.error.mock.calls[1][0]).toBe('Route not attached');
    });

    each([
      ['method', { path: '/:name', middleware: [noop] }],
      ['path', { method: 'get', middleware: [noop] }],
      ['middleware', { path: '/:name', method: 'get' }],
    ]).it('does not call router with custom routes when route object is missing property %s', (prop, route) => {
      const router = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      const customRoutes = [route];
      const logger = { error: noop };

      routes(router, noop, logger, {}, customRoutes);
      expect(router.get).toHaveBeenCalledTimes(4);
      expect(router.put).toHaveBeenCalledTimes(1);
      expect(router.post).toHaveBeenCalledTimes(1);
      expect(router.delete).toHaveBeenCalledTimes(1);
    });

    it('does not call router with custom routes when routes is an empty array', () => {
      const router = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      const customRoutes = [];
      routes(router, noop, noop, {}, customRoutes);
      expect(router.get).toHaveBeenCalledTimes(4);
      expect(router.put).toHaveBeenCalledTimes(1);
      expect(router.post).toHaveBeenCalledTimes(1);
      expect(router.delete).toHaveBeenCalledTimes(1);
    });

    it('calls router with custom routes', () => {
      const router = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      const customGetMiddleware = () => {};
      const secondCustomGetMiddleware = () => {};
      const customPostMiddleware = () => {};
      const customPutMiddleware = () => {};
      const customDeleteMiddleware = () => {};
      const customRoutes = [
        {
          method: 'get',
          path: '/:name',
          middleware: [customGetMiddleware, secondCustomGetMiddleware],
        },
        {
          method: 'post',
          path: '/',
          middleware: [customPostMiddleware],
        },
        {
          method: 'put',
          path: '/:name',
          middleware: [customPutMiddleware],
        },
        {
          method: 'delete',
          path: '/:name',
          middleware: [customDeleteMiddleware],
        },
      ];

      routes(router, noop, noop, {}, customRoutes);

      expect(router.get).toHaveBeenCalledTimes(5);
      expect(router.get.mock.calls[0][0]).toEqual('/:name');
      expect(router.get.mock.calls[0][1]).toEqual(customGetMiddleware);
      expect(router.get.mock.calls[0][2]).toEqual(secondCustomGetMiddleware);

      expect(router.put).toHaveBeenCalledTimes(2);
      expect(router.put.mock.calls[0][0]).toEqual('/:name');
      expect(router.put.mock.calls[0][1]).toEqual(customPutMiddleware);

      expect(router.post).toHaveBeenCalledTimes(2);
      expect(router.post.mock.calls[0][0]).toEqual('/');
      expect(router.post.mock.calls[0][1]).toEqual(customPostMiddleware);

      expect(router.delete).toHaveBeenCalledTimes(2);
      expect(router.delete.mock.calls[0][0]).toEqual('/:name');
      expect(router.delete.mock.calls[0][1]).toEqual(customDeleteMiddleware);
    });
  });
});
