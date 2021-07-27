import express from 'express'
import path from 'path';

const processor = (req: express.Request, res: express.Response): void => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	console.log(`file name: ${fileName}\nwidth: ${width}\nheight: ${height}`);
	const options = {
		root: path.join(__dirname, '../assets/thumbs/')
	}
	// res.sendFile(`${fileName as string}_${width}-${height}.jpg`, options, (err) => {
	res.sendFile(`${fileName}_${width}x${height}.jpg`, options, (err) => {
		if(err) {
			console.log(err);
		}
	})
}

export default processor;
