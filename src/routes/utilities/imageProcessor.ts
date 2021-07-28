import express from 'express'
import path from 'path';
import { promises as fs } from 'fs';

const processor = (req: express.Request, res: express.Response): void => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	const options = {
		root: path.join(__dirname, '../assets/thumbs/')
	}
	// return requested file if exist with the required dimensions
	res.sendFile(`${fileName}_${width}x${height}.jpg`, options, async (err) => {
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
