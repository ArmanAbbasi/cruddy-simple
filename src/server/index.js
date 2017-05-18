import Koa from 'koa';
import KoaRouter from 'koa-router';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import Ajv from 'ajv';

import routes from '../routes';
import { validateBodyWithSchema, validateContentType } from '../services';

export default schema => (db, host, port, endpoint) => {
  const app = new Koa();
  const koaRouter = new KoaRouter({ prefix: `/${endpoint}` });
  const router = routes(koaRouter, db);

  const validator = new Ajv({ allErrors: true }).compile(schema);

  app.use(cors());
  app.use(bodyParser());
  app.use(validateContentType('application/json'));
  app.use(validateBodyWithSchema(validator));
  app.use(router.routes());

  return app.listen(port, () => console.log({ message: `Server running at ${host}:${port}` }));
};
