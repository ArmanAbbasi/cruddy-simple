import Ajv from 'ajv';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { validate, ui } from 'swagger2-koa';

import routes from '../routes';
import { validateBodyWithSchema, validateContentType } from '../services';

export default (schema, config, swaggerDoc, logger) => db => {
  const { host, port, resource } = config;

  const app = new Koa();

  const koaRouter = new KoaRouter({ prefix: `/${resource}` });
  const router = routes(koaRouter, db, logger);

  const validator = new Ajv({ allErrors: true }).compile(schema);

  app.use(cors());
  app.use(bodyParser());
  app.use(validateContentType('application/json'));
  app.use(validateBodyWithSchema(validator));
  app.use(router.routes());
  app.use(validate(swaggerDoc));
  app.use(ui(swaggerDoc, '/swagger'));

  return app.listen(port, () => logger.info(`INFO: Server running at ${host}:${port}`));
};
