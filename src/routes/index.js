import React from 'react';
import { renderToString } from 'react-dom/server';

import schema from '../schema/option-group';

import Single from '../ui/components/Single.jsx';
import All from '../ui/components/All.jsx';
import NewResource from '../ui/components/Create.jsx';
import html from '../ui/html';

import { destroy, get, getAll, post, put } from '../services';

export const getAdmin = (db, resource) => async ctx => {
  const { id } = ctx.params;
  const result = await db.readById(id);
  result.fold(
    e => ctx.throw(500, 'WTF'),
    async data => {
      console.log('*'.repeat(1000));

      const appString = await renderToString(<Single schema={schema} data={data} resource={resource} />);
      ctx.body = html(appString, schema, data, resource);
    }
  );
  return ctx;
};

export const getAllAdmin = (db, resource) => async ctx => {
  const { id } = ctx.params;
  const result = await db.read();
  result.fold(
    e => ctx.throw(500, e.message),
    async data => {
      const appString = await renderToString(<All schema={schema} data={data} resource={resource} />);
      ctx.body = html(appString, schema, data, resource);
    }
  );
  return ctx;
};

export const newResource = resource => async ctx => {
  const data = {};
  const appString = await renderToString(<NewResource schema={schema} data={data} resource={resource} />);
  ctx.body = html(appString, schema, data, resource);
  return ctx;
};

export default (router, db, resource) => {
  router.get('/', getAll(db));
  router.get('/admin', getAllAdmin(db, resource));
  router.get('/admin/new', newResource(resource));

  router.get('/:id', get(db));

  router.get('/:id/admin', getAdmin(db, resource));

  router.post('/', post(db));

  router.put('/:id', put(db));

  router.delete('/:id', destroy(db));

  return router;
};
