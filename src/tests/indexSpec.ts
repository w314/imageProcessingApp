import { agent as request } from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path'


const invalidFileName: string = 'invalidImage.jpg'
const width: string = '600';
const height: string = '400';
const testFile = path.join('..', '..', 'assets', 'thumbs', 'fjord_400x600.jpg');

beforeAll( () => {
  //delete testFile
  try {
    console.log(`\n\nBefore tests deleting testfile: ${testFile}`)
    fs.unlinkSync(testFile);
    console.log(`Succes, testfile is deleted.`)
  }
  catch (err) {
    // console.log()
    const errorMessage = (err as Error).message
    if(errorMessage.startsWith('ENOENT')) {
      console.log(`Succes, tesfile was already missing from directory.`);
    }
    else {
      console.log(errorMessage);
    }
      

    
    // console.log(errno)
  }
});


// tests api/images endpoint with no file parameter
describe('Checking endpoint', () => {
  it('handles missing file parameter', (done) => {
    request(app)
      .get('/api/images?width=600&height=400')
      .expect(400)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then((response) => {
        expect(response.text).toBe('Cannot process request, no file parameter in url.');
        done();
      })
      .catch((Error) => {
        Error ? done.fail(Error) : done();
      });
  });
  // tests api/images endpoint with invalid file parameter
  it('handles invalid file name', (done) => {
    request(app)
      .get('/api/images?file=nonexistentImage')
      .expect(400)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then(response => {
        expect(response.text).toBe('Cannot process request, image nonexistentImage.jpg does not exist.');
        done();
      })
      .catch(Error => {
        Error ? done.fail(Error) : done();
      });
  });
  // tests api/images to send original image file if no width and no height parameters are given
  it('sends original image file if no width and no height parameters are given in url', (done) => {
    request(app)
      .get('/api/images?file=fjord')
      .expect(200)
      // .catch(Error => {
      //   Error ? done.fail(Error) : done();
      // })
      .end(function(err, res) {
        if (err) {
          done.fail(err);
        } else {
          done();
        }
      });
  })
});
