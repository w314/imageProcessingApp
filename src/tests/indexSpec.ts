import { agent as request } from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path'


const invalidFileName: string = 'invalidImage.jpg'
const image: string = 'fjord';
const width: string = '600';
const height: string = '400';
const thumbsDir: string = path.join('.', 'assets', 'thumbs');
const testFile = path.join(`${thumbsDir}`, `${image}_${width}x${height}.jpg`);

beforeAll( () => {
  //delete testFile
  try {
    console.log('\n\nBEFORE ALL')
    console.log(`Deleting testfile: ${testFile}`)
    fs.unlinkSync(testFile);
    console.log(`OK, testfile is deleted.`)
  }
  catch (err) {
    // console.log()
    const errorMessage = (err as Error).message
    if(errorMessage.startsWith('ENOENT')) {
      console.log(err)
      console.log(`OK, tesfile was already missing from directory.`);
    }
    else {
      console.log(err);
    }
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
      .get(`/api/images?file=nonexistentImage`)
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
  // tests creating requested image
  it('creates requested image with requested width and height', async (done) => {
    await request(app)
      // .get(`/api/image?file=${image}&width=${width}&height=${height}`)
      .get('/api/images?file=fjord&width=600&height=400')
      .expect(200)
      .expect('Content-Length', '41523')
      // .end((err,res) => {

      // })

  })
});

