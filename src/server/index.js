import Ajv from 'ajv';
import auth from 'koa-basic-auth';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import cors from 'koa-cors';
import eTag from 'koa-etag';
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
    logger = console, // add a fatal wrapper
    middleware = [],
    port,
    resource,
    routes: customRoutes = [],
    schema,
    swaggerDoc,
    eTag = true,
    cors = true,
  } = config;

  const app = new Koa();

  const koaRouter = new KoaRouter({ prefix: `/${resource}` });
  const router = routes(koaRouter, db, logger, schema, customRoutes);

  if (eTag) {
    app.use(conditional());
    app.use(eTag());
  }

  if (cors) {
    app.use(cors());
  }

  app.use(bodyParser());
  app.use(validateContentType('application/json'));

  if (schema) {
    const validator = new Ajv({ allErrors: true }).compile(schema);
    app.use(validateBodyWithSchema(validator));
  }

  if (credentials) {
    app.use(authUnsafeMethods(auth(credentials)));
  }

  middleware.forEach(m => app.use(m));

  app.use(router.routes());
  app.use(router.allowedMethods());

  if (swaggerDoc) {
    app.use(validate(swaggerDoc));
    app.use(ui(swaggerDoc, '/docs'));
  }

  return app.listen(port, () => logger.info(`INFO: Server running at ${host}`));
};
