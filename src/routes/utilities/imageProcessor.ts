import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';
import { exit } from 'process';

const processor = (req: express.Request, res: express.Response): void => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	const optionsThumbs = {
		root: path.join(__dirname, '../assets/thumbs/')
	}
	const optionsImages = {
		root: path.join(__dirname, '../assets/images/')
	}
	// return requested file if exist with the required dimensions
	console.log(`\n${fileName}.jpg ${width} x ${height} is requested`);
	if(fileName == undefined) {
		// throw Error('No file name given.');
		res.send('Cannot process picture, no file parameter in url.');
	}

	if(width == undefined && height == undefined) {
		console.log(`No width and height parameters are given, returning original ${fileName}.jpg`);
		res.sendFile(`${fileName}.jpg`, optionsImages, async (err) => {
			if (err) {
				console.log(err);
			}
		})
		return;
	}

	

	res.sendFile(`${fileName}_${width}x${height}.jpg`, optionsThumbs, async (err) => {
		if(err) {
			console.log(`${fileName}.jpg with width: ${width} and height: ${height} doesn't exists.`);
			// check if file requested exist under images folder
			try {
				await fs.access(path.resolve(__dirname, '../assets/images/',`${fileName}.jpg`));
				console.log(`File name ${fileName}.jpg available to resize.`);
			}
			catch (err) {
				// console.log(err);
				console.log(`There is no such file as ${fileName}`);
			}
		}
		else {
			console.log(`Returning ${fileName}.jpg, width: ${width}, height: ${height}`);
		}
	})
}

export default processor;
