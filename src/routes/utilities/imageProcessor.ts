import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';
import { exit, nextTick } from 'process';
import sharp from 'sharp';

const isPositiveInteger = (numString: string) => {
	const num: number  = Math.floor(Number(numString))
	return String(num) === numString && num > 0;
}

const fileExists = (directory: string, file: string) => {
	const filePath = path.join('.', 'assets', directory, file)
	return new Promise(async (resolve, reject) => {
		await fs.stat(filePath)
		.then((response) => { resolve(true) })
		.catch((err) => { reject()})
	})
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

	// // if there is no width of height return original image
	// if(width == undefined && height == undefined) {
	// 	const message = `No width and height parameters are given, returning original assets/images/${fileName}.jpg`;
	// 	console.log(`SERVER LOG: ${message}`);
	// 	res.status(200).sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
	// 		if (err) {
	// 			console.log('SERVER LOG: error while sending original image');
	// 			console.log(`SERVER LOG: ${err}`);
	// 		}
	// 	})
	// 	return;
	// }



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
	
	// check if requested image exists
	await fileExists('thumbs', imageFile)
	// requested image exists send existing file 
	.then((response) => {
		res.sendFile(imageFile, optionsThumbs, async (err) => {
			if(err) {
				console.log(`SERVER LOG: ${err}`)
			}
			else {
				console.log(`SERVER LOG: ${imageFile} already exists, returning existing file.`)
			}
		})
	})
	// requested image doesn't exists, create and store one
	.catch(async (err) => {
		console.log(`SERVER LOG: ${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`);
		try {
			console.log('SERVER LOG: resizing image...');
			// convert width and height to number if they are not undefined
			const resizeWidth = width == undefined ? undefined : parseInt(width as string, 10)
			const resizeHeight = height == undefined ? undefined : parseInt(height as string, 10)
			// resizing image
			await sharp(path.resolve(__dirname, `${imageDir}`, `${fileName}.jpg`))
				.resize(resizeWidth, resizeHeight, {
					fit: 'cover'
				})
				// storing resized image 
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
	})

}

export default processor;
