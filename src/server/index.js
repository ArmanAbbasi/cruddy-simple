import Koa from 'koa';
import KoaRouter from 'koa-router';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';

import routes from '../routes';

export default (db, host, port, endpoint) => {
  const app = new Koa();
  const koaRouter = new KoaRouter({ prefix: `/${endpoint}` });
  const router = routes(koaRouter, db);

  app.use(cors());
  app.use(bodyParser());
  app.use(router.routes());

  return app.listen(port, () => console.log({ message: `Server running at ${host}:${port}` }));
};
