import Ajv from 'ajv';
import auth from 'koa-basic-auth';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import cors from 'koa-cors';
import etag from 'koa-etag';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { validate, ui } from 'swagger2-koa';

import routes from '../routes';
import { authUnsafeMethods, validateBodyWithSchema, validateContentType } from '../services';

export default config => {
  const {
    credentials,
    db,
    host,
    logger,
    middleware = [],
    port,
    isPutUpsert,
    resource,
    routes: customRoutes = [],
    schema,
    swaggerDoc,
  } = config;

  const app = new Koa();

  const koaRouter = new KoaRouter({ prefix: `/${resource}` });
  const router = routes(koaRouter, db, logger, schema, customRoutes, isPutUpsert);

  const validator = new Ajv({ allErrors: true }).compile(schema);

  app.use(conditional());
  app.use(etag());
  app.use(cors());
  app.use(bodyParser());
  app.use(validateContentType('application/json'));
  app.use(validateBodyWithSchema(validator));
  app.use(authUnsafeMethods(auth(credentials)));

  middleware.forEach(m => app.use(m));

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(validate(swaggerDoc));
  app.use(ui(swaggerDoc, '/docs'));

  return app.listen(port, () => logger.info(`INFO: Server running at ${host}:${port}`));
};
