import { compose } from 'ramda';

import { NotFoundError } from '../utils';

const serverError = ctx => errorMessage => ctx.throw(500, errorMessage);

const setBody = ctx => data => {
  ctx.body = data;
  return ctx;
};

const setStatus = statusCode => ctx => {
  ctx.status = statusCode;
  return ctx;
};

const notFoundError = ctx => ctx.throw(404);

const badRequest = (ctx, errorMessage) => ctx.throw(400, errorMessage);

const mapError = ctx => error => {
  if (error instanceof NotFoundError) {
    return notFoundError(ctx);
  }

  return serverError(ctx)(error);
};

export const getAll = db => async ctx => {
  const result = await db.read();
  result.fold(serverError(ctx), setBody(ctx));
  return ctx;
};

export const get = db => async ctx => {
  const { id } = ctx.params;
  const result = await db.readById(id);
  result.fold(mapError(ctx), setBody(ctx));
  return ctx;
};

export const post = db => async ctx => {
  if (ctx.request.body.id) return badRequest(ctx, 'Cannot include id in request body');

  const result = await db.create(ctx.request.body);
  result.fold(serverError(ctx), compose(setStatus(201), setBody(ctx)));
  return ctx;
};
