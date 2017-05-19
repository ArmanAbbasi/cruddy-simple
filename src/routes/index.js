import { destroy, get, getAll, post, put } from '../services';

export default (router, db, logger) => {
  router.get('/', getAll(db, logger));

  router.get('/:id', get(db, logger));

  router.post('/', post(db, logger));

  router.put('/:id', put(db, logger));

  router.delete('/:id', destroy(db, logger));

  return router;
};
