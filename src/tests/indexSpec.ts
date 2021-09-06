import { agent as request } from 'supertest';
import app from '../index';


const invalidFileName: string = 'invalidImage.jpg'
const width: string = '600';
const height: string = '400';


//test api/sampleRoute endpoint with no file parameter
describe('Checking endpoint', () => {
  it('responds with "Cannot process picture, no file parameter in url." when file parameter is missing in  url', (done) => {
    request(app)
      .get('/api/sampleRoute?width=600&height=400')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then((response) => {
        expect(response.text).toBe('Cannot process picture, no file parameter in url.');
        done();
      })
      .catch((Error) => {
        Error ? done.fail(Error) : done();
      });
  });
  it('responds with "Invalid image file." when non-existent file name is given', (done) => {
    request(app)
      .get('/api/sampleRoute?file=nonexistentImage')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then(response => {
        expect(response.text).toBe('Invalid image file.');
        done();
      })
      .catch(Error => {
        Error ? done.fail(Error) : done();
      });
  });
});
