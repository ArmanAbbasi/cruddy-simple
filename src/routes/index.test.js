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
      routes(router, db);
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
      routes(router, db);
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
      routes(router, db);
      expect(postSpy).toHaveBeenCalledWith('/', expect.any(Function));
    });
  });

  describe('PUT /:id', () => {
    it('calls router put with /:id and a function', () => {
      const putSpy = jest.fn();
      const router = {
        get: noop,
        post: noop,
        put: putSpy,
        delete: noop,
      };
      const db = { read: () => {} };
      routes(router, db);
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
      routes(router, db);
      expect(deleteSpy).toHaveBeenCalledWith('/:id', expect.any(Function));
    });
  });
});
