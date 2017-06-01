import request from 'supertest';

import InMemoryDb from '../persistence/inMemoryDb';

import server from './';

describe('CRUD Server', () => {
  const resource = 'group';
  const schema = {
    type: 'object',
    properties: {
      options: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    },
    required: ['options'],
  };
  const swaggerDoc = {
    info: {
      title: 'Person',
    },
    paths: [],
  };

  const credentials = {
    name: 'abc',
    pass: 'def',
  };

  describe(`GET /${resource}`, () => {
    let db;
    let app;

    beforeEach(() => {
      db = InMemoryDb();
      const config = {
        credentials,
        db,
        host: 'localhost',
        port: 8000,
        logger: console,
        resource,
        schema,
        swaggerDoc,
      };
      app = server(config);
    });

    afterEach(() => {
      app.close();
    });

    it('responds with content type json', async () => {
      await request(app).get(`/${resource}`).expect('Content-Type', /json/).expect(200);
    });

    it('responds with status 200 and empty array when no data exist', async () => {
      await request(app).get(`/${resource}`).expect(200, []);
    });

    it('responds with status 200 and array of existing data', async () => {
      db.create({ options: [1, 2, 3] });
      db.create({ options: [4] });
      db.create({ options: [5, 6, 7] });
      await request(app)
        .get(`/${resource}`)
        .expect(200, [{ id: 1, options: [1, 2, 3] }, { id: 2, options: [4] }, { id: 3, options: [5, 6, 7] }]);
    });
  });
});
