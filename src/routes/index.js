import { destroy, get, getAll, health, post, put, schemaMiddleware } from '../services';

export default (router, db, logger, schema) => {
  router.get('/healthz', health);

  router.get('/schema', schemaMiddleware(schema));

  router.get('/', getAll(db, logger));

  router.get('/:id', get(db, logger));

  router.post('/', post(db, logger));

  router.put('/:id', put(db, logger));

  router.delete('/:id', destroy(db, logger));

  return router;
};
