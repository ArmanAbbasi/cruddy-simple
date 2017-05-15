const serverError = ctx => err => ctx.throw(500, err);

const setBody = ctx => data => (ctx.body = data);

export const getAll = db => async ctx => {
  const result = await db.read();
  result.fold(serverError(ctx), setBody(ctx));
  return ctx;
};
