import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';
import { exit } from 'process';
import sharp from 'sharp';

const processor = async (req: express.Request, res: express.Response): Promise<void> => {
	// console.log(`\n\nRequested URL`)
	// console.log(req.originalUrl);
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
	
	console.log(`\n${imageFile} is requested`);
	
	//if no file parameter recevied in url return with 400
	if(fileName == undefined) {
		const message = 'Cannot process request, no file parameter in url.';
		res.status(400).send(message);
		console.log(message);
		return;
	}

	// check if file name given in file parameter is a valid image
	try {
		await fs.access(path.resolve(__dirname, imageDir, `${fileName}.jpg` ))
	}
	catch (err) {
		const message = `Cannot process request, image ${fileName}.jpg does not exist.`;
		res.status(400).send(message);
		console.log(message);
		return;
	}


	// if there neither width nor height parameters are given return original image
	if(width == undefined && height == undefined) {
		const message = `No width and height parameters are given, returning original assets/images/${fileName}.jpg`;
		console.log(message);
		res.status(200).sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
			if (err) {
				console.log('error while sending original image');
				console.log(err);
			}
		})
		return;
	}
	
	// return requested file if exist with the required dimensions
	res.sendFile(imageFile, optionsThumbs, async (err) => {
		// if image thumb is missing create and send new image thumb
		if(err) {
			console.log(`${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`);
			try {
				console.log('resizing image...');
				// resizing image
				const image =  sharp(path.resolve(__dirname, `${imageDir}`, `${fileName}.jpg`))
				await image
				.resize(parseInt(width as string, 10), parseInt(height as string, 10), {
					fit: 'cover'
				})
				// stroing resized image
				.toFile(outputFile)		
				//returning resized image
				res.status(200).sendFile(imageFile, optionsThumbs, async (err) => {
					if(err) {
						console.log('error while sending resized image')
						console.log(err)
					}
					else {
						// console.log(res)
						console.log(`Created, stored and returned ${imageFile}`)
						// deleting stored file for testing purposes
						// await fs.unlink(outputFile);

					}
				})
			}
			catch  (err) {
				console.log(err);
			}
		}
		else {
			console.log(`${imageFile} already exists, returning existing file.`)
		}
	});
}

export default processor;
