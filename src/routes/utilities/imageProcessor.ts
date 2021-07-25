import express from 'express'

const processor = (req: express.Request, res: express.Response): void => {
	const fileName = req.query.file;
	const width = req.query.width;
	const height = req.query.height;
	console.log(`file name: ${fileName}\nwidth: ${width}\nheight: ${height}`);
}

export default processor;
