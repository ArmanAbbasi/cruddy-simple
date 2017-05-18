import request from 'supertest';

import InMemoryDb from '../persistence/inMemoryDb';

import app from './';

describe('CRUD Server', () => {
  const host = 'localhost';
  const port = 8080;
  const endpoint = 'group';

  describe('GET /${endpoint}', () => {
    let db;
    let server;

    beforeEach(() => {
      db = InMemoryDb();
    });

    afterEach(() => {
      server.close();
    });

    it('responds with content type json', async () => {
      server = app(db, host, port, endpoint);
      await request(server).get(`/${endpoint}`).expect('Content-Type', /json/).expect(200);
    });

    it('responds with status 200 and empty array when no data exist', async () => {
      server = app(db, host, port, endpoint);
      await request(server).get(`/${endpoint}`).expect(200, []);
    });

    it('responds with status 200 and array of existing data', async () => {
      db.create({ options: [1, 2, 3] });
      db.create({ options: [4] });
      db.create({ options: [5, 6, 7] });
      server = app(db, host, port, endpoint);
      await request(server)
        .get(`/${endpoint}`)
        .expect(200, [{ id: 1, options: [1, 2, 3] }, { id: 2, options: [4] }, { id: 3, options: [5, 6, 7] }]);
    });
  });
});