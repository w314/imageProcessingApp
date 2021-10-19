import { agent as request } from 'supertest';
import app from '../index';
import { promises as fs } from 'fs';
import path from 'path'
import { doesNotMatch, doesNotReject, rejects } from 'assert';
import { resolve } from 'path/posix';


// const thumbFile: string = `${image}_${width}x${height}`;
const thumbsDir: string = path.join('.', 'assets', 'thumbs');
const invalidFileName: string = 'invalidImage.jpg'
const existingThumbName: string = 'palmtunnel_300x200.jpg'
const existingThumbName1: string = 'palmtunnel_400x200.jpg'
const existingThumbPath: string = path.join(`${thumbsDir}`, `${existingThumbName}`);
const existingThumbPath1: string = path.join(`${thumbsDir}`, `${existingThumbName1}`);
const image: string = 'fjord';
const width: string = '600';
const height: string = '400';
const testFile = path.join(`${thumbsDir}`, `${image}_${width}x${height}.jpg`);
const optionsThumbs = {
  root: path.join(__dirname, thumbsDir)
}
const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

beforeAll( async () => {
  
  //delete testFile
  try {
    console.log('\n\nBEFORE ALL')
    console.log(`Deleting testfile: ${testFile}`)
    await fs.unlink(testFile);
    console.log(`OK, testfile is deleted.`)
  }
  catch (err) {
    // console.log()
    const errorMessage = (err as Error).message
    if(errorMessage.startsWith('ENOENT')) {
      // console.log(err)
      console.log(`OK, tesfile was already missing from directory.`);
    }
    else {
      console.log(err);
    }
  }
});

// beforeEach(() => {
//   jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
// })

// afterEach(() => {
//   jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
// })

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
  // tests creating requested new image
  it('creates requested image with requested width and height', async (done) => {
    await request(app)
      // .get(`/api/image?file=${image}&width=${width}&height=${height}`)
      .get('/api/images?file=fjord&width=600&height=400')
      .expect(200)
      .expect('Content-Length', '41523')
      // check if file is saved under thumbs
      .then( async () => {
        console.log(`TEST: Checking if created fjord_600x400.jpg is saved in thumbs directory`)
        try {
          const fileAccess =  await fs.access(testFile)
          console.log(`TEST: File is saved`)
          done()
        }
        catch(err) {
          // rejects(new Error(`File not created, err: ${err}`))
          done.fail('TEST: Created file is not saved under thumbs directory');
        }
      })
  })  
  // test requesting already created thumb image    
  it('serves image from under thumbs directory if it exists', async () => {
    // check if file to be requested already exists
    await expectAsync(fs.stat(existingThumbPath)).toBeResolved()
    console.log(`TEST: file to be requested already exists under thumbs directory`)

    // count number of files under thumbs directory before making request
    const startingFileNumber = await fs.readdir.length
    console.log(`TEST: number of files under thumbs folder before request: ${startingFileNumber}`)
    
    //request image
    request(app)
      .get('/api/images?file=palmtunnel&width=300&height=200')
      .expect(200)

    // check that no new files were created during request
    const currentFileNumber = fs.readdir.length
    console.log(`TEST: Number of files under thumbs folder after request: ${currentFileNumber}`)
    expect(currentFileNumber).toEqual(startingFileNumber)
    console.log(`TEST: No new file were saved under thumbs folder`)    
    })
})