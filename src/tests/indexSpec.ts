import { agent as request } from 'supertest';
import app from '../index';
import { promises as fs } from 'fs';
import path from 'path';
import resizeImage from '../routes/utilities/utilities';

const thumbsDir: string = path.join('.', 'assets', 'thumbs');
const endPoint = '/api/images';
const thumbFilePath = (fileName: string, width: string, height: string) => {
  return path.join(`${thumbsDir}`, `${fileName}_${width}x${height}.jpg`);
};
const urlString = (fileName?: string, width?: string, height?: string) => {
  let urlString = `${endPoint}`;
  if (fileName) {
    urlString += `?file=${fileName}`;
  }
  if (width) {
    urlString += `&width=${width}`;
  }
  if (height) {
    urlString += `&height=${height}`;
  }
  return urlString;
};

const deleteFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
    console.log(`TEST: OK, ${filePath} is deleted.`);
  } catch (err) {
    // console.log()
    const errorMessage = (err as Error).message;
    if (errorMessage.startsWith('ENOENT')) {
      // console.log(err)
      console.log(`TEST: OK, tesfile was already missing from directory.`);
    } else {
      console.log(`TEST: ${err}`);
    }
  }

}


// test resizing utility
describe('Tests resizeImage utility', () => {
  it('resizes image and saves it under thumbs direcotry', async (done) => {
    const fileName = 'icelandwaterfall'
    const width = '400'
    const height = '300'
    const testFile: string = thumbFilePath(fileName, width, height)
    const inputFile: string = path.join('.','assets','images',`${fileName}.jpg`)
      try {
      // set-up delete testfile if exists
      await deleteFile(testFile)
      // resize image
      await resizeImage(inputFile, width, height, testFile)
      // check if image is saved under thumbs directory
      await expectAsync(fs.stat(testFile)).toBeResolved();
      // clean-up delete testFile
      await deleteFile(testFile)
      done()
    }
    catch(err) {
      console.log(`TEST: ${err}`)
      done.fail(`${err}`)
    }
  })
})

// tests api/images endpoint
describe('Checking API/images endpoint', () => {
  // tests missing file parameter
  it('handles missing file parameter', (done) => {
    request(app)
      .get(urlString())
      .expect(400)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then((response) => {
        expect(response.text).toBe(
          'Cannot process request, no file parameter in url.'
        );
        done();
      })
      .catch((Error) => {
        done.fail(Error);
      });
  });

  // tests invalid width parameter
  it('handles invalid width parameter', (done) => {
    const fileName = 'fjord';
    const width = '0.1';
    request(app)
      .get(urlString(fileName, width))
      .expect(400)
      .then((response) => {
        expect(response.text).toBe(
          'Cannot process request, width has to be a positive integer'
        );
        done();
      })
      .catch((Error) => {
        done.fail(Error);
      });
  });

  // test invalid height parameter
  it('handles invalid height parameter', (done) => {
    const fileName = 'fjord';
    const height = '-9.9';
    request(app)
      .get(urlString(fileName, undefined, height))
      .expect(400)
      .then((response) => {
        expect(response.text).toBe(
          'Cannot process request, height has to be a positive integer'
        );
        done();
      })
      .catch((Error) => {
        done.fail(Error);
      });
  });

  // tests invalid height parameter

  // tests invalid file parameter
  it('handles invalid file name', (done) => {
    const fileName = 'nonexistentImage';
    request(app)
      .get(urlString(fileName))
      .expect(404)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .then((response) => {
        expect(response.text).toBe(`Requested file not found.`);
        done();
      })
      .catch((Error) => {
        Error ? done.fail(Error) : done();
      });
  });

  // tests

  // tests api/images to send original image file if no width and no height parameters are given
  it('sends original image file if no width and no height parameters are given in url', (done) => {
    const fileName = 'fjord';
    request(app)
      .get(urlString(fileName))
      .expect(200)
      .end(function (err) {
        if (err) {
          done.fail(err);
        } else {
          done();
        }
      });
  });

  // tests creating requested new image
  it('creates requested image with requested width and height', async (done) => {
    const fileName = 'fjord';
    const width = '600';
    const height = '400';
    const testFile = thumbFilePath(fileName, width, height);

    // set-up delete testFile if necessary
    console.log(`\nTEST: Set-Up: Deleting ${testFile} if exists.`);
    await deleteFile(testFile)

    // request file 
    await request(app)
      .get(urlString(fileName, width, height))
      .expect(200)
      .expect('Content-Length', '41523');

    // check if file was saved
    await expectAsync(fs.stat(testFile)).toBeResolved();
    console.log(`TEST: Checked, that requested file was saved as ${testFile}`);

    // clean-up: delete created testFile
    console.log(`TEST: delete ${testFile} to clean up.`);
    await deleteFile(testFile)
    done();
  });

  // test requesting already created thumb image
  it('serves image from under thumbs directory if it exists', async () => {
    const fileName = 'palmtunnel';
    const width = '300';
    const height = '200';
    const testFile = thumbFilePath(fileName, width, height);

    // check if file to be requested already exists
    await expectAsync(fs.stat(testFile)).toBeResolved();
    console.log(
      `\nTEST: file to be requested already exists under thumbs directory`
    );

    // count number of files under thumbs directory before making request
    const startingFileNumber = await fs.readdir.length;
    console.log(
      `TEST: number of files under thumbs folder before request: ${startingFileNumber}`
    );

    //request image
    await request(app).get(urlString(fileName, width, height)).expect(200);

    // check that no new files were created during request
    const currentFileNumber = await fs.readdir.length;
    console.log(
      `TEST: Number of files under thumbs folder after request: ${currentFileNumber}`
    );
    expect(currentFileNumber).toEqual(startingFileNumber);
    console.log(`TEST: No new file were saved under thumbs folder`);
  });
});
