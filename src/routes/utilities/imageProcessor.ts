import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';
import { exit } from 'process';
import sharp from 'sharp';

const isPositiveInteger = (numString: string) => {
	const num: number  = Math.floor(Number(numString))
	return String(num) === numString && num > 0;
}

const processor = async (req: express.Request, res: express.Response): Promise<void> => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	const imageFile = `${fileName}_${width}x${height}.jpg`;
	const assetsDir:string = path.join('..', '..','..','assets');
	const imageDir: string = path.join(`${assetsDir}`, `images`);
	const thumbsDir: string = path.join(`${assetsDir}`, `thumbs`);
	const outputFile: string = path.join('.', 'assets', 'thumbs',`${imageFile}`);
	const optionsThumbs = {
		root: path.join(__dirname, thumbsDir)
	}
	const optionsImages = {
		root: path.join(__dirname, imageDir)
	}
	
	console.log(`\nSERVER LOG: ${imageFile} is requested`);
	
	// check if parameters are valid
	// if no file parameter recevied in url return with 400
	if(fileName == undefined) {
		const message = 'Cannot process request, no file parameter in url.';
		res.status(400).send(message);
		console.log(`SERVER LOG: ${message}`);
		return;
	}
	// width and height should be undefined or positive integers	
	if(width != undefined && !isPositiveInteger(width as string)) {
		const message = 'Cannot process request, width has to be a positive integer'
		res.status(400).send(message);
		console.log(`SERVER LOG: ${message}`)
		return;
	}
	if(height != undefined && !isPositiveInteger(height as string)) {
		const message = 'Cannot process request, height has to be a positive integer'
		res.status(400).send(message);
		console.log(`SERVER LOG: ${message}`)
		return;
	}

	// check if file name given in file parameter is a valid image
	try {
		await fs.access(path.resolve(__dirname, imageDir, `${fileName}.jpg` ))
	}
	catch (err) {
		const message = `Cannot process request, image ${fileName}.jpg does not exist.`;
		res.status(404).send(message);
		console.log(`SERVER LOG: ${message}`);
		return;
	}

	// if there neither width nor height parameters are given return original image
	if(width == undefined && height == undefined) {
		const message = `No width and height parameters are given, returning original assets/images/${fileName}.jpg`;
		console.log(`SERVER LOG: ${message}`);
		res.status(200).sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
			if (err) {
				console.log('SERVER LOG: error while sending original image');
				console.log(`SERVER LOG: ${err}`);
			}
		})
		return;
	}
	
	// return requested file if exist with the required dimensions
	res.sendFile(imageFile, optionsThumbs, async (err) => {
		// if image thumb is missing create and send new image thumb
		if(err) {
			console.log(`SERVER LOG: ${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`);
			try {
				console.log('SERVER LOG: resizing image...');
				// resizing image
				await sharp(path.resolve(__dirname, `${imageDir}`, `${fileName}.jpg`))
					.resize(parseInt(width as string, 10), parseInt(height as string, 10), {
						fit: 'cover'
					})
					// stroing resized image
					.toFile(outputFile)		
				//returning resized image
				res.status(200).sendFile(imageFile, optionsThumbs, async (err) => {
					if(err) {
						console.log('SERVER LOG: error while sending resized image')
						console.log(`SERVER LOG: ${err}`)
					}
					else {
						console.log(`SERVER LOG: Created, stored and returned ${imageFile}`)

					}
				})
			}
			catch  (err) {
				console.log(`SERVER LOG: ${err}`);
			}
		}
		else {
			console.log(`SERVER LOG: ${imageFile} already exists, returning existing file.`)
		}
	});
}

export default processor;
