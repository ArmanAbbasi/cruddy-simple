import { destroy, get, getAll, post, put } from '../services';

export default (router, db) => {
  router.get('/', getAll(db));

  router.get('/:id', get(db));

  router.post('/', post(db));

  router.put('/:id', put(db));

  router.delete('/:id', destroy(db));

  return router;
};
