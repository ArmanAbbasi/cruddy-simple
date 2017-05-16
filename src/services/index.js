const serverError = ctx => err => ctx.throw(500, err);

const setBody = ctx => data => (ctx.body = data);

const notFoundError = ctx => ctx.throw(404);

export const getAll = db => async ctx => {
  const result = await db.read();
  result.fold(serverError(ctx), setBody(ctx));
  return ctx;
};

export const get = db => async ctx => {
  const { id } = ctx.params;
  const result = await db.readById(id);
  ctx.body = result.fold(serverError(ctx), group => {
    if (!group.Item) {
      return notFoundError(ctx);
    }
    return setBody(ctx)(group);
  });
  return ctx;
};
