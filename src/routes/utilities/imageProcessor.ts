import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';
import { exit } from 'process';
import sharp from 'sharp';

const processor = async (req: express.Request, res: express.Response): Promise<void> => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	const imageDir: string = '../assets/images/';
	const outputFile: string = `./src/routes/assets/thumbs/${fileName}_${width}x${height}.jpg`;
	const optionsThumbs = {
		root: path.join(__dirname, '../assets/thumbs/')
	}
	const optionsImages = {
		root: path.join(__dirname, '../assets/images/')
	}
	
	console.log(`\n${fileName}.jpg ${width} x ${height} is requested`);
	
	//if no file parameter recevied in url send error message
	if(fileName == undefined) {
		res.send('Cannot process request, no file parameter in url.');
		return;
	}

	//if there is a file parameter, check if such an image exists
	// const image = (async () => {
	// 	try {
	// 		console.log(`Cheking if ${fileName}.jpg exists.`);
	// 		const imageFile = await fs.stat(path.resolve(__dirname, imageDir, `${fileName}.jpg`))
	// 		return imageFile;
	// 	}
	// 	// if such image does not exists send error message
	// 	catch (err) {
	// 		res.send(`Cannot process request, image ${fileName}.jpg does not exist.`)
	// 		// console.log(`${fileName} image doesn't exist`)
	// 		// return (undefined);
	// 		return undefined;
	// 	}
	// })();
	try {
		const image = await fs.stat(path.resolve(__dirname, imageDir, `${fileName}.jpg`));
		console.log(image);
	}
	catch (err) {
		res.send(`Cannot process request, image ${fileName}.jpg does not exist.`)
		console.log('image not found');
		return;
	}
	


	// image()
	// 	.then( (result) =>  {
	// 		console.log('result from teh promis is:')
	// 		console.log(result);
	// 	})
	// console.log(image());


	// console.log('image is: ')
	// console.log(image);


	// if no with and height parameters are present return original picture
	if(width == undefined && height == undefined) {
		console.log(`No width and height parameters are given, returning original ${fileName}.jpg`);
		res.sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
			if (err) {
				console.log(err);
			}
		})
		return;
	}

	
	// return requested file if exist with the required dimensions
	res.sendFile(`${fileName}_${width}x${height}.jpg`, optionsThumbs, async (err) => {
		if(err) {
			console.log(`${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`);
			// check if file requested exist under images folder
			try {
				await fs.access(path.resolve(__dirname, '../assets/images/',`${fileName}.jpg`));
				console.log(`File name ${fileName}.jpg available to resize.`);
				try {
					// const originalFile = 
					console.log('resizing image...');
					// const image = sharp(path.resolve(__dirname, '../assets/images/', `${fileName}.jpg`));
					// image
					// 	.metadata()
					// 	.then(metadata => {
					// 		console.log(metadata);
					// 	})
					const image = sharp(path.resolve(__dirname, '../assets/images/', `${fileName}.jpg`))
					image
						// .metadata()
						// 	.then(metadata => {
						// 		console.log(metadata);
						// 	})
						.resize(parseInt(width as string, 10), parseInt(height as string, 10), {
							fit: 'cover'
						})
						// .toBuffer()
						// .then(data => {
						// 	res.send(data);
						// })				
						// .toFile('output.jpg')
						.toFile(outputFile)		
						// .toFile(outputFile, (err, info) => {
						// 	console.log('in toFile');
						// 	console.log(err);
						// 	console.log(info);
						// })
				}
				catch  (err) {
					console.log(err);
				}

			}
			catch (err) {
				// console.log(err);
				console.log(`There is no such file as ${fileName}`);
				// create image with required dimensions
			}
		}
		else {
			console.log(`Returning ${fileName}.jpg, width: ${width}, height: ${height}`);
		}
	})
}

export default processor;
