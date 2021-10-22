import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import resizeImage  from './utilities';
import { pathToFileURL } from 'url';

const isPositiveInteger = (numString: string) => {
  const num: number = Math.floor(Number(numString));
  return String(num) === numString && num > 0;
};

const fileExists = (directory: string, file: string) => {
  const filePath = path.join('.', 'assets', directory, file);
  return new Promise((resolve, reject) => {
    fs.stat(filePath)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        reject();
      });
  });
};

const processor = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const fileName = req.query.file;
  const width = req.query.width;
  const height = req.query.height;
  const imageFile = `${fileName}_${width}x${height}.jpg`;
  const assetsDir: string = path.join('..', '..', '..', 'assets');
  const imageDir: string = path.join(`${assetsDir}`, `images`);
  const thumbsDir: string = path.join(`${assetsDir}`, `thumbs`);
  const outputFile: string = path.join('.', 'assets', 'thumbs', `${imageFile}`);
  const optionsThumbs = {
    root: path.join(__dirname, thumbsDir),
  };
  const optionsImages = {
    root: path.join(__dirname, imageDir),
  };

  const fileNotFound = () => {
    const message = 'Requested file not found.';
    res.status(404).send(message);
    console.log(`SERVER LOG: ${message}`);
  };

  console.log(`\nSERVER LOG: ${imageFile} is requested`);

  // if no file parameter recevied in url return with 400
  if (fileName == undefined) {
    const message = 'Cannot process request, no file parameter in url.';
    res.status(400).send(message);
    console.log(`SERVER LOG: ${message}`);
    return;
  }

  // if there are no width and no height parameter return original image
  if (width == undefined && height == undefined) {
    // check if requested file is valid
    await fileExists('images', `${fileName}.jpg`)
      // valid file name send file
      .then(async () => {
        const message = `No width and height parameters are given, returning original assets/images/${fileName}.jpg`;
        console.log(`SERVER LOG: ${message}`);
        res
          .status(200)
          .sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
            if (err) {
              console.log('SERVER LOG: error while sending original image');
              console.log(`SERVER LOG: ${err}`);
            }
          });
      })
      // invalid file name send error message
      .catch(() => {
        fileNotFound();
      })
      .finally(() => {
        return;
      });
  }

  // width and height should be undefined or positive integers
  if (width != undefined && !isPositiveInteger(width as string)) {
    const message =
      'Cannot process request, width has to be a positive integer';
    res.status(400).send(message);
    console.log(`SERVER LOG: ${message}`);
    return;
  }
  if (height != undefined && !isPositiveInteger(height as string)) {
    const message =
      'Cannot process request, height has to be a positive integer';
    res.status(400).send(message);
    console.log(`SERVER LOG: ${message}`);
    return;
  }

  // if either width or height parameter is defined return thumb image
  if (width || height) {
    // check if requested thumb image already exists
    await fileExists('thumbs', imageFile)
      // requested image exists send existing file
      .then(() => {
        res.sendFile(imageFile, optionsThumbs, async (err) => {
          if (err) {
            console.log(`SERVER LOG: Error while sending existing thumb file`);
            console.log(`SERVER LOG: ${err}`);
          } else {
            console.log(
              `SERVER LOG: ${imageFile} already exists, returning existing file.`
            );
          }
        });
      })
      // requested image doesn't exists, create and store one
      .catch(async () => {
        // check if original image to create thumb from exists
        console.log(
          `SERVER LOG: ${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`
        );
        console.log(`SERVER LOG: checking if ${fileName} image exists`);
        await fileExists('images', `${fileName}.jpg`)
          // original image exists resizing to create thumb
          .then(async () => {
            try {
              console.log('SERVER LOG: resizing image...');
			  const imagePath = path.resolve(__dirname,`${imageDir}`, `${fileName}.jpg`)
			  await resizeImage(imagePath, width as string, height as string, outputFile)
            //   convert width and height to number if they are not undefined
            //   const resizeWidth =
            //     width == undefined ? undefined : parseInt(width as string, 10);
            //   const resizeHeight =
            //     height == undefined
            //       ? undefined
            //       : parseInt(height as string, 10);
              // resizing image
            //   await sharp(
            //     path.resolve(__dirname, `${imageDir}`, `${fileName}.jpg`)
            //   )
            //     .resize(resizeWidth, resizeHeight, {
            //       fit: 'cover',
            //     })
            //     // storing resized image
            //     .toFile(outputFile);
              //returning resized image
              res
                .status(200)
                .sendFile(imageFile, optionsThumbs, async (err) => {
                  if (err) {
                    console.log(
                      'SERVER LOG: error while sending resized image'
                    );
                    console.log(`SERVER LOG: ${err}`);
                  } else {
                    console.log(
                      `SERVER LOG: Created, stored and returned ${imageFile}`
                    );
                  }
                });
            } catch (err) {
              console.log(`SERVER LOG: Erro while resizing image`);
              console.log(`SERVER LOG: ${err}`);
            }
          })
          // fileName provided is invalid send error message
          .catch(() => {
            fileNotFound();
          });
      });
	  };
  }

export default processor;
