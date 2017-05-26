import { compose, isEmpty } from 'ramda';

import { NotFoundError } from '../utils';

const ID_IN_REQUEST_ERROR_MESSAGE = 'Cannot include id in request body';

const serverError = (ctx, logger) => error => {
  logger.error(`ERROR: ${error.message}`);
  return ctx.throw(500, error.message);
};

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

const mapError = (ctx, logger) => error => {
  if (error instanceof NotFoundError) return notFound(ctx);

  return serverError(ctx, logger)(error);
};

export const authUnsafeMethods = authMiddleware => async (ctx, next) => {
  const { method } = ctx.request;
  if (method !== 'GET') {
    return await authMiddleware(ctx, next);
  }
  return await next();
};

export const getAll = (db, logger) => async ctx => {
  const result = await db.read();
  result.fold(mapError(ctx, logger), setBody(ctx));
  return ctx;
};

export const get = (db, logger) => async ctx => {
  const { id } = ctx.params;
  const result = await db.readById(id);
  result.fold(mapError(ctx, logger), setBody(ctx));
  return ctx;
};

export const health = ctx => (ctx.body = '"OK"');

export const post = (db, logger) => async ctx => {
  if (ctx.request.body.id) return badRequest(ctx, ID_IN_REQUEST_ERROR_MESSAGE);

  const result = await db.create(ctx.request.body);
  result.fold(mapError(ctx, logger), compose(setStatus(201), setBody(ctx)));
  return ctx;
};

export const put = (db, logger) => async ctx => {
  const { id } = ctx.params;
  const { body } = ctx.request;

  if (body.id) return badRequest(ctx, ID_IN_REQUEST_ERROR_MESSAGE);

  const result = await db.update(id, body);
  result.fold(mapError(ctx, logger), setBody(ctx));
  return ctx;
};

export const destroy = (db, logger) => async ctx => {
  const { id } = ctx.params;
  const result = await db.delete(id);
  result.fold(mapError(ctx, logger), () => setStatus(204)(ctx));
  return ctx;
};

export const schemaMiddleware = schema => async ctx => {
  return (ctx.body = schema);
};

export const validateContentType = type => async (ctx, next) => {
  const valid = ctx.is(type);
  if (valid === false) return ctx.throw(400, `Error content type must be ${type}`);

  return next();
};

export const validateBodyWithSchema = validator => async (ctx, next) => {
  if (!isEmpty(ctx.request.body)) {
    var valid = validator(ctx.request.body);
    if (!valid) {
      return ctx.throw(400, JSON.stringify(validator.errors, null, 2));
    }
  }

  return next();
};
