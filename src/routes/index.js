import { destroy, get, getAll, health, post, put, schemaMiddleware, upsert } from '../services';

const NOT_ATTACHED_MESSAGE = 'Route not attached';

const missingPropertyMessage = prop => `Route missing ${prop} property`;

export default (router, db, logger, schema, customRoutes, putCanCreate) => {
  customRoutes.forEach(route => {
    if (!route.method) {
      logger.error(missingPropertyMessage('method'), route);
      logger.error(NOT_ATTACHED_MESSAGE);
      return;
    }
    if (!route.path) {
      logger.error(missingPropertyMessage('path'), route);
      logger.error(NOT_ATTACHED_MESSAGE);
      return;
    }
    if (!route.middleware) {
      logger.error(missingPropertyMessage('middleware'), route);
      logger.error(NOT_ATTACHED_MESSAGE);
      return;
    }
    router[route.method.toLowerCase()](route.path, ...route.middleware);
  });

  router.get('/healthz', health);

  router.get('/schema', schemaMiddleware(schema));

  router.get('/', getAll(db, logger));

  router.get('/:id', get(db, logger));

  router.post('/', post(db, logger));

  if (putCanCreate) {
    router.put('/:id', upsert(db, logger));
  } else {
    router.put('/:id', put(db, logger));
  }

  router.delete('/:id', destroy(db, logger));

  return router;
};
