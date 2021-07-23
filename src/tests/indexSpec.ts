import { agent as request } from 'supertest';
import app from '../index';

//test api/sampleRoute endpoint
describe('GET api/sampleRoute', () => {
  it('responds with: Application starting page', (done) => {
    request(app)
      .get('/api/sampleRoute')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then((response) => {
        expect(response.text).toBe('Application starting page');
        done();
      })
      .catch((Error) => {
        Error ? done.fail(Error) : done();
      });
  });
});
