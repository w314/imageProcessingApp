import express from 'express';
import processor from '../utilities/imageProcessor'

//create router object
const sampleRoute = express.Router();

//set up route
sampleRoute.get('/', processor, (req, res) => {
  // res.send('Application starting page');
});

//export route
export default sampleRoute;
