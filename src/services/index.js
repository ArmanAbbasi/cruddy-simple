import { compose } from 'ramda';

import { NotFoundError } from '../utils';

const ID_IN_REQUEST_ERROR_MESSAGE = 'Cannot include id in request body';

const serverError = ctx => error => ctx.throw(500, error.message);

const setBody = ctx => data => {
  ctx.body = data;
  return ctx;
};

const setStatus = statusCode => ctx => {
  ctx.status = statusCode;
  return ctx;
};

const notFound = ctx => ctx.throw(404);

const badRequest = (ctx, message) => ctx.throw(400, message);

const mapError = ctx => error => {
  if (error instanceof NotFoundError) return notFound(ctx);

  return serverError(ctx)(error);
};

export const getAll = db => async ctx => {
  const result = await db.read();
  result.fold(mapError(ctx), setBody(ctx));
  return ctx;
};

export const get = db => async ctx => {
  const { id } = ctx.params;
  const result = await db.readById(id);
  result.fold(mapError(ctx), setBody(ctx));
  return ctx;
};

export const post = db => async ctx => {
  if (ctx.request.body.id) return badRequest(ctx, ID_IN_REQUEST_ERROR_MESSAGE);

  const result = await db.create(ctx.request.body);
  result.fold(mapError(ctx), compose(setStatus(201), setBody(ctx)));
  return ctx;
};

export const put = db => async ctx => {
  const { id } = ctx.params;
  const { body } = ctx.request;

  if (body.id) return badRequest(ctx, ID_IN_REQUEST_ERROR_MESSAGE);

  const result = await db.update(id, body);
  result.fold(mapError(ctx), setBody(ctx));
  return ctx;
};

export const destroy = db => async ctx => {
  const { id } = ctx.params;
  const result = await db.delete(id);
  result.fold(mapError(ctx), setBody(ctx));
  return ctx;
};

export const validateContentType = type => async (ctx, next) => {
  const valid = ctx.is(type);
  if (valid === false) return ctx.throw(400, `Error content type must be ${type}`);

  return next();
};

export const validateBodyWithSchema = validator => async (ctx, next) => {
  if (ctx.request.body) {
    var valid = validator(ctx.request.body);
    if (!valid) {
      ctx.throw(400, JSON.stringify(validator.errors, null, 2));
    }
  }

  return next();
};
